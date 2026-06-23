import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { DEFAULT_SEARCH_OUTPUT_CONTEXT_LINES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/default-search-output-context-lines.constant';
import { DEFAULT_SEARCH_OUTPUT_MAX_MATCHES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/default-search-output-max-matches.constant';
import { SearchOutputInputZodSchema } from 'src/engine/core-modules/tool/tools/output-navigation-tool/search-output-tool.schema';
import { searchOutput } from 'src/engine/core-modules/tool/tools/output-navigation-tool/utils/search-output.util';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { isDefined } from 'twenty-shared/utils';

type SearchOutputInput = {
  fileId: string;
  pattern: string;
  maxMatches?: number;
  offset?: number;
  contextLines?: number;
};

@Injectable()
export class SearchOutputTool implements Tool {
  private readonly logger = new Logger(SearchOutputTool.name);

  description =
    'Search (grep-like) within a large spilled tool output for a text or regex pattern, returning matching lines with surrounding context. Supports stateless pagination via offset. Use this to locate an error message or key in a file too large to inline.';

  inputSchema = SearchOutputInputZodSchema;

  constructor(private readonly fileService: FileService) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { workspaceId } = context;
    const { fileId, pattern, maxMatches, offset, contextLines } =
      parameters as SearchOutputInput;

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

    if (!isDefined(fileContent)) {
      return {
        success: false,
        message: 'Output file not found',
        error: `File "${fileId}" not found or no longer available.`,
      };
    }

    const rawContent = fileContent.buffer.toString('utf-8');

    let content: string;

    try {
      content = JSON.stringify(JSON.parse(rawContent), null, 2);
    } catch {
      content = rawContent;
    }

    const result = searchOutput({
      content,
      pattern,
      maxMatches: maxMatches ?? DEFAULT_SEARCH_OUTPUT_MAX_MATCHES,
      offset: offset ?? 0,
      contextLines: contextLines ?? DEFAULT_SEARCH_OUTPUT_CONTEXT_LINES,
    });

    return {
      success: true,
      message:
        result.totalMatches === 0
          ? `No matches for "${pattern}"`
          : `Found ${result.totalMatches} match(es) for "${pattern}"`,
      result,
    };
  }
}
