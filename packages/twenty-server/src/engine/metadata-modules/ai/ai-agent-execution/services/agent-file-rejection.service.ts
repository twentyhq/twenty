import { Injectable, Logger } from '@nestjs/common';

import {
  type LanguageModelV4,
  type LanguageModelV4CallOptions,
  type LanguageModelV4FilePart,
  type LanguageModelV4Prompt,
  type LanguageModelV4TextPart,
} from '@ai-sdk/provider';
import { APICallError, type LanguageModelMiddleware } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentFileDeliveryState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-file-delivery-state.type';
import { buildFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-file-placeholder.util';

const FILE_REJECTION_STATUS_CODES = new Set([400, 413, 422]);
const PROMPT_TOO_LONG_ERROR_PATTERN =
  /context.length|prompt is too long|input is too long|maximum prompt length|maximum number of tokens/i;

type FileFallbackArguments = {
  params: LanguageModelV4CallOptions;
  model: LanguageModelV4;
  deliveryState: AgentFileDeliveryState;
};

@Injectable()
export class AgentFileRejectionService {
  private readonly logger = new Logger(AgentFileRejectionService.name);

  buildMiddleware(
    deliveryState: AgentFileDeliveryState,
  ): LanguageModelMiddleware {
    return {
      specificationVersion: 'v4',
      transformParams: async ({ params }) => ({
        ...params,
        prompt: await this.replaceFileParts({
          prompt: params.prompt,
          replaceFilePart: (part) =>
            this.replaceUnreadableFilePart({ part, deliveryState }),
        }),
      }),
      wrapStream: async ({ doStream, params, model }) => {
        try {
          const stream = await doStream();

          await this.markFilesDelivered({
            prompt: params.prompt,
            deliveryState,
          });

          return stream;
        } catch (error) {
          return this.retryWithoutRefusedFiles({
            fileRejection: error,
            params,
            model,
            deliveryState,
          });
        }
      },
    };
  }

  private async retryWithoutRefusedFiles({
    fileRejection,
    params,
    model,
    deliveryState,
  }: FileFallbackArguments & { fileRejection: unknown }) {
    let rejection = fileRejection;
    let currentParams = params;

    const buildFallbackPrompts = [
      (fallback: FileFallbackArguments) => this.sendFileUrlsAsBytes(fallback),
      (fallback: FileFallbackArguments) =>
        this.removeUndeliveredFiles(fallback),
    ];

    for (const buildFallbackPrompt of buildFallbackPrompts) {
      if (!this.isFileRejection(rejection, currentParams.prompt)) {
        throw rejection;
      }

      if (this.isPromptTooLong(rejection)) {
        break;
      }

      const prompt = await buildFallbackPrompt({
        params: currentParams,
        model,
        deliveryState,
      });

      if (prompt === currentParams.prompt) {
        continue;
      }

      this.logger.warn(`Provider refused a file: ${rejection.message}`);

      currentParams = { ...currentParams, prompt };

      try {
        const stream = await model.doStream(currentParams);

        await this.markFilesDelivered({
          prompt: currentParams.prompt,
          deliveryState,
        });

        return stream;
      } catch (nextRejection) {
        rejection = nextRejection;
      }
    }

    if (
      !this.isFileRejection(rejection, currentParams.prompt) ||
      !this.isPromptTooLong(rejection)
    ) {
      throw rejection;
    }

    this.logger.warn(`Provider refused all files: ${rejection.message}`);

    const streamWithoutFiles = await model.doStream({
      ...currentParams,
      prompt: await this.replaceFileParts({
        prompt: currentParams.prompt,
        replaceFilePart: (part) =>
          buildFilePlaceholder({ part, reason: 'rejected' }),
      }),
    });

    deliveryState.areFilesRejected = true;

    return streamWithoutFiles;
  }

  private isFileRejection(
    error: unknown,
    prompt: LanguageModelV4Prompt,
  ): error is APICallError {
    return (
      APICallError.isInstance(error) &&
      FILE_REJECTION_STATUS_CODES.has(error.statusCode ?? 0) &&
      this.getPromptFileParts(prompt).length > 0
    );
  }

  private isPromptTooLong({
    message,
    responseBody,
  }: Pick<APICallError, 'message' | 'responseBody'>): boolean {
    return PROMPT_TOO_LONG_ERROR_PATTERN.test(`${message} ${responseBody}`);
  }

  private getPromptFileParts(
    prompt: LanguageModelV4Prompt,
  ): LanguageModelV4FilePart[] {
    return prompt.flatMap((message) =>
      message.role === 'user'
        ? message.content.filter((part) => part.type === 'file')
        : [],
    );
  }

  private replaceFileParts({
    prompt,
    replaceFilePart,
  }: {
    prompt: LanguageModelV4Prompt;
    replaceFilePart: (
      part: LanguageModelV4FilePart,
    ) =>
      | LanguageModelV4FilePart
      | LanguageModelV4TextPart
      | Promise<LanguageModelV4FilePart | LanguageModelV4TextPart>;
  }): Promise<LanguageModelV4Prompt> {
    return Promise.all(
      prompt.map(async (message) => {
        if (message.role !== 'user') {
          return message;
        }

        return {
          ...message,
          content: await Promise.all(
            message.content.map((part) =>
              part.type === 'file' ? replaceFilePart(part) : part,
            ),
          ),
        };
      }),
    );
  }

  private replaceUnreadableFilePart({
    part,
    deliveryState,
  }: {
    part: LanguageModelV4FilePart;
    deliveryState: Pick<AgentFileDeliveryState, 'fileLoader'>;
  }) {
    if (part.data.type !== 'url') {
      return part;
    }

    return deliveryState.fileLoader.isFileUnreadable(part.data.url.toString())
      ? buildFilePlaceholder({ part, reason: 'unavailable' })
      : part;
  }

  private async sendFileUrlsAsBytes({
    params: { prompt },
    deliveryState,
  }: FileFallbackArguments): Promise<LanguageModelV4Prompt> {
    const hasFileUrl = this.getPromptFileParts(prompt).some(
      (part) => part.data.type === 'url',
    );

    if (!hasFileUrl) {
      return prompt;
    }

    deliveryState.canSendSignedUrls = false;

    return this.replaceFileParts({
      prompt,
      replaceFilePart: (part) =>
        this.replaceFileUrlWithBytes({ part, deliveryState }),
    });
  }

  private async replaceFileUrlWithBytes({
    part,
    deliveryState: { fileLoader, limits },
  }: {
    part: LanguageModelV4FilePart;
    deliveryState: Pick<AgentFileDeliveryState, 'fileLoader' | 'limits'>;
  }) {
    if (part.data.type !== 'url') {
      return part;
    }

    const bytes = limits.mimeTypesRequiringUrl.has(part.mediaType)
      ? null
      : await fileLoader.loadFileBytes(part.data.url.toString());

    if (!isDefined(bytes)) {
      return buildFilePlaceholder({ part, reason: 'unavailable' });
    }

    return { ...part, data: { type: 'data' as const, data: bytes } };
  }

  private async removeUndeliveredFiles({
    params: { prompt },
    deliveryState,
  }: FileFallbackArguments): Promise<LanguageModelV4Prompt> {
    const undeliveredFileParts = new Set<LanguageModelV4FilePart>();

    for (const part of this.getPromptFileParts(prompt)) {
      const fileId = await this.getFilePartFileId({
        part,
        fileLoader: deliveryState.fileLoader,
      });

      if (isDefined(fileId) && deliveryState.deliveredFileIds.has(fileId)) {
        continue;
      }

      undeliveredFileParts.add(part);

      if (isDefined(fileId)) {
        deliveryState.rejectedFileIds.add(fileId);
      }
    }

    if (undeliveredFileParts.size === 0) {
      return prompt;
    }

    return this.replaceFileParts({
      prompt,
      replaceFilePart: (part) =>
        undeliveredFileParts.has(part)
          ? buildFilePlaceholder({ part, reason: 'rejected' })
          : part,
    });
  }

  private async markFilesDelivered({
    prompt,
    deliveryState: { fileLoader, deliveredFileIds },
  }: {
    prompt: LanguageModelV4Prompt;
    deliveryState: Pick<
      AgentFileDeliveryState,
      'fileLoader' | 'deliveredFileIds'
    >;
  }): Promise<void> {
    const fileIds = await Promise.all(
      this.getPromptFileParts(prompt).map((part) =>
        this.getFilePartFileId({ part, fileLoader }),
      ),
    );

    for (const fileId of fileIds.filter(isDefined)) {
      deliveredFileIds.add(fileId);
    }
  }

  private async getFilePartFileId({
    part,
    fileLoader,
  }: {
    part: LanguageModelV4FilePart;
    fileLoader: AgentFileDeliveryState['fileLoader'];
  }): Promise<string | undefined> {
    if (part.data.type === 'url') {
      const file = await fileLoader.loadFile(part.data.url.toString());

      return file?.id;
    }

    if (part.data.type === 'data' && part.data.data instanceof Uint8Array) {
      return fileLoader.getFileIdOfBytes(part.data.data);
    }

    return undefined;
  }
}
