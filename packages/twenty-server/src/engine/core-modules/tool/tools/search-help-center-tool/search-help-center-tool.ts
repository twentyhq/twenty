import { Injectable } from '@nestjs/common';

import { isAxiosError } from 'axios';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import {
  type SearchHelpCenterInput,
  SearchHelpCenterInputZodSchema,
} from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool.schema';
import { buildHelpCenterErrorDetail } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/build-help-center-error-detail.util';
import { extractHelpCenterResults } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/extract-help-center-results.util';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

const HELP_CENTER_MCP_URL = 'https://docs.twenty.com/mcp';
const HELP_CENTER_MCP_SEARCH_TOOL_NAME = 'search_twenty_documentation';
const HELP_CENTER_REQUEST_TIMEOUT_MS = 10_000;
const HELP_CENTER_REQUEST_RETRIES = 2;

const buildSearchFailedMessage = (query: string) =>
  `Could not search Twenty's documentation for "${query}". Do not guess menus, buttons, options or steps from memory: say you could not confirm them and offer to do the task when your tools can.`;

@Injectable()
export class SearchHelpCenterTool implements Tool {
  description =
    "Search Twenty's documentation before saying how to do something in Twenty, where it is or whether it exists. Name only the menus, buttons, options and steps its results show.";
  inputSchema = SearchHelpCenterInputZodSchema;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { query } = parameters as SearchHelpCenterInput;

    try {
      const httpClient = this.secureHttpClientService.getHttpClient({
        timeout: HELP_CENTER_REQUEST_TIMEOUT_MS,
        retries: HELP_CENTER_REQUEST_RETRIES,
        shouldResetTimeout: true,
      });

      const response = await httpClient.post(
        HELP_CENTER_MCP_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: HELP_CENTER_MCP_SEARCH_TOOL_NAME,
            arguments: { query },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/event-stream',
          },
          responseType: 'text',
        },
      );

      const extraction = extractHelpCenterResults(response.data);

      if (!extraction.isReadable) {
        return {
          success: false,
          message: buildSearchFailedMessage(query),
          error: extraction.error,
        };
      }

      const { results } = extraction;

      if (results.length === 0) {
        return {
          success: true,
          message: `No documentation found for "${query}". Say you could not confirm it and offer to do the task when your tools can.`,
          result: [],
        };
      }

      return {
        success: true,
        message: `Found ${results.length} documentation result${results.length === 1 ? '' : 's'} for "${query}". Name only the menus, buttons, options and steps they show, never from memory. If they do not answer, say you could not confirm it and offer to do the task when your tools can.`,
        result: results,
      };
    } catch (error) {
      const errorDetail = isAxiosError(error)
        ? buildHelpCenterErrorDetail(error)
        : error instanceof Error
          ? error.message
          : 'Help center search failed';

      return {
        success: false,
        message: buildSearchFailedMessage(query),
        error: errorDetail,
      };
    }
  }
}
