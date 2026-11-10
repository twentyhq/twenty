import { Injectable, Logger } from '@nestjs/common';

import {
  type LanguageModelV4,
  type LanguageModelV4CallOptions,
  type LanguageModelV4FilePart,
  type LanguageModelV4Prompt,
  type LanguageModelV4TextPart,
  type LanguageModelV4Usage,
} from '@ai-sdk/provider';
import { isNull, isString } from '@sniptt/guards';
import { APICallError, type LanguageModelMiddleware } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentFileDeliveryState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-file-delivery-state.type';
import { buildFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-file-placeholder.util';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';

const FILE_REJECTION_STATUS_CODES = new Set([400, 413, 422]);
const PROMPT_TOO_LONG_ERROR_PATTERN =
  /context.length|prompt is too long|input is too long|maximum prompt length|maximum number of tokens/i;
const FILE_CHECK_PROMPT = 'Reply with OK.';
const FILE_CHECK_MAX_OUTPUT_TOKENS = 16;

type FileFallbackArguments = {
  params: LanguageModelV4CallOptions;
  model: LanguageModelV4;
  deliveryState: AgentFileDeliveryState;
};

type FilePartCheckArguments = FileFallbackArguments & {
  part: LanguageModelV4FilePart;
};

@Injectable()
export class AgentFileRejectionService {
  private readonly logger = new Logger(AgentFileRejectionService.name);

  constructor(private readonly aiBillingService: AiBillingService) {}

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
          return await doStream();
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
      (fallback: FileFallbackArguments) => this.removeRejectedFiles(fallback),
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
        return await model.doStream(currentParams);
      } catch (nextRejection) {
        rejection = nextRejection;
      }
    }

    if (!this.isFileRejection(rejection, currentParams.prompt)) {
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

  private async replaceUnreadableFilePart({
    part,
    deliveryState,
  }: {
    part: LanguageModelV4FilePart;
    deliveryState: Pick<AgentFileDeliveryState, 'fileLoader'>;
  }) {
    if (part.data.type !== 'url') {
      return part;
    }

    const loadedBytes = await deliveryState.fileLoader.getLoadedFileBytes(
      part.data.url.toString(),
    );

    return isNull(loadedBytes)
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

  private async removeRejectedFiles(
    fallback: FileFallbackArguments,
  ): Promise<LanguageModelV4Prompt> {
    const rejectedFileParts = new Set<LanguageModelV4FilePart>();

    for (const part of this.getPromptFileParts(fallback.params.prompt)) {
      if (await this.isFilePartRejected({ ...fallback, part })) {
        rejectedFileParts.add(part);
      }
    }

    if (rejectedFileParts.size === 0) {
      return fallback.params.prompt;
    }

    return this.replaceFileParts({
      prompt: fallback.params.prompt,
      replaceFilePart: (part) =>
        rejectedFileParts.has(part)
          ? buildFilePlaceholder({ part, reason: 'rejected' })
          : part,
    });
  }

  private async isFilePartRejected(
    filePartCheck: FilePartCheckArguments,
  ): Promise<boolean> {
    const { part, deliveryState } = filePartCheck;

    if (part.data.type !== 'data' || isString(part.data.data)) {
      return false;
    }

    const fileBytes = part.data.data;
    const previousRejection =
      deliveryState.fileRejectionsByBytes.get(fileBytes);

    if (isDefined(previousRejection)) {
      return previousRejection;
    }

    const isRejected = await this.sendFilePartCheck(filePartCheck);

    deliveryState.fileRejectionsByBytes.set(fileBytes, isRejected);

    return isRejected;
  }

  private async sendFilePartCheck({
    part,
    params: { abortSignal, headers, providerOptions },
    model,
    deliveryState,
  }: FilePartCheckArguments): Promise<boolean> {
    const prompt: LanguageModelV4Prompt = [
      {
        role: 'user',
        content: [part, { type: 'text', text: FILE_CHECK_PROMPT }],
      },
    ];

    try {
      const { usage } = await model.doGenerate({
        prompt,
        maxOutputTokens: FILE_CHECK_MAX_OUTPUT_TOKENS,
        abortSignal,
        headers,
        providerOptions,
      });

      this.billFilePartCheck({ usage, deliveryState });

      return false;
    } catch (error) {
      if (!this.isFileRejection(error, prompt)) {
        throw error;
      }

      return true;
    }
  }

  private billFilePartCheck({
    usage: { inputTokens, outputTokens },
    deliveryState: { modelId, workspaceId, operationType, spenders },
  }: {
    usage: LanguageModelV4Usage;
    deliveryState: Pick<
      AgentFileDeliveryState,
      'modelId' | 'workspaceId' | 'operationType' | 'spenders'
    >;
  }): void {
    void this.aiBillingService
      .calculateAndBillUsage({
        modelId,
        billingInput: {
          usage: {
            inputTokens: inputTokens.total,
            outputTokens: outputTokens.total,
            inputTokenDetails: {
              cacheReadTokens: inputTokens.cacheRead,
              cacheWriteTokens: inputTokens.cacheWrite,
            },
            outputTokenDetails: { reasoningTokens: outputTokens.reasoning },
          },
        },
        workspaceId,
        operationType,
        spenders,
      })
      .catch((error: unknown) =>
        this.logger.error(
          `Could not bill a file check in workspace ${workspaceId}`,
          error instanceof Error ? error.stack : error,
        ),
      );
  }
}
