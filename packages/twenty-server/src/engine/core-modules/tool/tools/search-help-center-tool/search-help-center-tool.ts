import { Injectable } from '@nestjs/common';

import { isAxiosError } from 'axios';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { SearchHelpCenterInputZodSchema } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool.schema';
import { buildHelpCenterErrorDetail } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/build-help-center-error-detail.util';
import { extractHelpCenterResults } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/extract-help-center-results.util';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// Without an API key the tool falls back to a search proxy shared by every
// self-hosted instance, which rate-limits and resets connections under load.
// An unbounded request there leaves the agent waiting indefinitely.
const HELP_CENTER_REQUEST_TIMEOUT_MS = 10_000;
const HELP_CENTER_REQUEST_RETRIES = 2;

@Injectable()
export class SearchHelpCenterTool implements Tool {
  description =
    'Search Twenty documentation and help center to find information about features, setup, usage, and troubleshooting.';
  inputSchema = SearchHelpCenterInputZodSchema;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { query } = parameters;

    try {
      const MINTLIFY_API_KEY = this.twentyConfigService.get('MINTLIFY_API_KEY');
      const MINTLIFY_SUBDOMAIN =
        this.twentyConfigService.get('MINTLIFY_SUBDOMAIN');

      const useDirectApi = MINTLIFY_API_KEY && MINTLIFY_SUBDOMAIN;

      const endpoint = useDirectApi
        ? `https://api-dsc.mintlify.com/v1/search/${MINTLIFY_SUBDOMAIN}`
        : 'https://twenty-help-search.com/search/twenty';

      const headers = {
        'Content-Type': 'application/json',
        ...(useDirectApi && { Authorization: `Bearer ${MINTLIFY_API_KEY}` }),
      };

      const httpClient = this.secureHttpClientService.getHttpClient({
        timeout: HELP_CENTER_REQUEST_TIMEOUT_MS,
        retries: HELP_CENTER_REQUEST_RETRIES,
        shouldResetTimeout: true,
      });

      const response = await httpClient.post(
        endpoint,
        { query, pageSize: 10 },
        { headers },
      );

      const extraction = extractHelpCenterResults(response.data);

      if (!extraction.isReadable) {
        return {
          success: false,
          message: `Failed to search help center for "${query}"`,
          error:
            'Help center search returned a response in an unrecognized shape',
        };
      }

      const { results } = extraction;

      if (results.length === 0) {
        return {
          success: true,
          message: `No help center articles found for "${query}"`,
          result: [],
        };
      }

      return {
        success: true,
        message: `Found ${results.length} relevant help center article${results.length === 1 ? '' : 's'} for "${query}"`,
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
        message: `Failed to search help center for "${query}"`,
        error: errorDetail,
      };
    }
  }
}
