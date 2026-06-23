import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { DEFAULT_EXTRACT_JSON_PATHS_MAX_DEPTH } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/default-extract-json-paths-max-depth.constant';
import { DEFAULT_EXTRACT_JSON_PATHS_MAX_ITEMS } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/default-extract-json-paths-max-items.constant';
import { ExtractJsonPathsInputZodSchema } from 'src/engine/core-modules/tool/tools/output-navigation-tool/extract-json-paths-tool.schema';
import {
  extractJsonPath,
  JsonPathError,
} from 'src/engine/core-modules/tool/tools/output-navigation-tool/utils/extract-json-path.util';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

type ExtractJsonPathsInput = {
  fileId: string;
  paths: string[];
  maxItems?: number;
  maxDepth?: number;
};

type ExtractedPathResult =
  | { path: string; value: unknown }
  | { path: string; error: string };

@Injectable()
export class ExtractJsonPathsTool implements Tool {
  private readonly logger = new Logger(ExtractJsonPathsTool.name);

  description =
    'Extract one or more sub-trees from a large spilled tool output (JSON) by path, without loading the whole file into context. Use the shape/skeleton returned with an outputRef to target paths. Reads and parses the file once, then resolves every path independently (a failing path does not discard the others). Each value is bounded by maxItems and maxDepth.';

  inputSchema = ExtractJsonPathsInputZodSchema;

  constructor(private readonly fileService: FileService) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { workspaceId } = context;
    const { fileId, paths, maxItems, maxDepth } =
      parameters as ExtractJsonPathsInput;

    const effectiveMaxItems = maxItems ?? DEFAULT_EXTRACT_JSON_PATHS_MAX_ITEMS;
    const effectiveMaxDepth = maxDepth ?? DEFAULT_EXTRACT_JSON_PATHS_MAX_DEPTH;

    let fileContent: { buffer: Buffer; mimeType: string } | null;

    try {
      fileContent = await this.fileService.getFileContentById({
        fileId,
        workspaceId,
        fileFolder: FileFolder.AgentChat,
      });
    } catch (error) {
      this.logger.warn(`Failed to read file ${fileId}`, error);

      return {
        success: false,
        message: 'Failed to read output file',
        error: error instanceof Error ? error.message : String(error),
      };
    }

    if (fileContent === null) {
      return {
        success: false,
        message: 'Output file not found',
        error: `File "${fileId}" not found or no longer available.`,
      };
    }

    let data: unknown;

    try {
      data = JSON.parse(fileContent.buffer.toString('utf-8'));
    } catch {
      return {
        success: false,
        message: 'Output file is not valid JSON',
        error:
          'The referenced file could not be parsed as JSON. Use search_output for free-text content.',
      };
    }

    const results = paths.map((path): ExtractedPathResult => {
      try {
        const value = extractJsonPath({
          data,
          path,
          maxItems: effectiveMaxItems,
          maxDepth: effectiveMaxDepth,
        });

        return { path, value };
      } catch (error) {
        if (error instanceof JsonPathError) {
          return { path, error: error.message };
        }

        throw error;
      }
    });

    const resolvedCount = results.filter(
      (result): result is { path: string; value: unknown } => 'value' in result,
    ).length;

    if (resolvedCount === 0) {
      return {
        success: false,
        message: 'Could not resolve any path',
        result: { results },
      };
    }

    return {
      success: true,
      message: `Extracted ${resolvedCount}/${paths.length} path(s)`,
      result: { results },
    };
  }
}
