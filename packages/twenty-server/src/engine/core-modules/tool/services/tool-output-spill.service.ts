import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { isObject } from 'class-validator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { MAX_INLINE_TOOL_OUTPUT_BYTES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/max-inline-tool-output-bytes.constant';
import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { formatBytes } from 'src/engine/core-modules/tool/utils/format-bytes.util';
import { jsonPreview } from 'src/engine/core-modules/tool/utils/json-preview.util';

type SpillContext = {
  workspaceId: string;
};

type SpillOptions = {
  toolName: string;
};

const OUTPUT_NAVIGATION_TOOL_NAME_SET = new Set<string>(
  OUTPUT_NAVIGATION_TOOL_NAMES,
);

@Injectable()
export class ToolOutputSpillService {
  private readonly logger = new Logger(ToolOutputSpillService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
  ) {}

  async spillIfTooLarge(
    output: ToolOutput,
    { workspaceId }: SpillContext,
    options: SpillOptions,
  ): Promise<ToolOutput> {
    if (!isDefined(output) || !isObject(output)) {
      return output;
    }

    if (OUTPUT_NAVIGATION_TOOL_NAME_SET.has(options.toolName)) {
      return output;
    }

    let serialized: string | undefined;

    try {
      serialized = JSON.stringify(output);
    } catch {
      return output;
    }

    if (!isDefined(serialized)) {
      return output;
    }

    const sizeBytes = Buffer.byteLength(serialized);

    if (sizeBytes <= MAX_INLINE_TOOL_OUTPUT_BYTES) {
      return output;
    }

    try {
      const preview = jsonPreview(output);
      const fileId = v4();
      const filename = `tool-output-${options.toolName}-${fileId}.json`;

      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        );

      const savedFile = await this.fileStorageService.writeFile({
        sourceFile: Buffer.from(serialized),
        fileFolder: FileFolder.AgentChat,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceId,
        resourcePath: `tool-output-spill/${fileId}.json`,
        fileId,
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      const hint = `Output too large to inline (${formatBytes(sizeBytes)}). "preview" is a truncated sample (first items, all keys); use extract_json_paths (for json objects) or search_output (for text) with this fileId to read the full data, or code_interpreter for analysis.`;

      return {
        success: output.success,
        message: output.message,
        result: {
          spilled: true,
          outputRef: {
            fileId: savedFile.id,
            filename,
          },
          preview,
          hint,
        },
      };
    } catch (error) {
      this.logger.warn(
        `Failed to spill large output for "${options.toolName}"; returning full output inline.`,
        error,
      );

      return {
        ...output,
        warnings: [
          ...(output.warnings ?? []),
          'Large output spill failed; the full output is returned inline.',
        ],
      };
    }
  }
}
