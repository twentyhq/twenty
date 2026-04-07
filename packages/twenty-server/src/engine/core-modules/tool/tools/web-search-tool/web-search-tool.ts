import { Injectable } from '@nestjs/common';

import { type WebSearchInput } from 'src/engine/core-modules/tool/tools/web-search-tool/web-search-input.type';
import { WebSearchInputZodSchema } from 'src/engine/core-modules/tool/tools/web-search-tool/web-search-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { WebSearchService } from 'src/engine/core-modules/web-search/web-search.service';

@Injectable()
export class WebSearchTool implements Tool {
  description =
    'Search the web for real-time information. Returns relevant results with titles, URLs, and content snippets. Supports optional category filtering for company, people, news, and other content types.';
  inputSchema = WebSearchInputZodSchema;

  constructor(private readonly webSearchService: WebSearchService) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { query, category, numResults } = parameters as WebSearchInput;

    try {
      const results = await this.webSearchService.search(
        query,
        { category, numResults },
        {
          workspaceId: context.workspaceId,
          userWorkspaceId: context.userWorkspaceId,
        },
      );

      return {
        success: true,
        message: `Found ${results.length} results for "${query}"${category ? ` (category: ${category})` : ''}`,
        result: results,
      };
    } catch (error) {
      return {
        success: false,
        message: `Web search failed for "${query}"`,
        error: error instanceof Error ? error.message : 'Web search failed',
      };
    }
  }
}
