import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { SearchArticlesToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/search-articles-tool/search-articles-tool.schema';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class SearchArticlesTool implements Tool {
  description =
    'Search Twenty documentation and help articles to find information about features, setup, usage, and troubleshooting.';
  inputSchema = SearchArticlesToolParametersZodSchema;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async execute(parameters: ToolInput): Promise<ToolOutput> {
    const { query } = parameters;

    try {
      const MINTLIFY_API_KEY = this.twentyConfigService.get('MINTLIFY_API_KEY');
      const MINTLIFY_SUBDOMAIN =
        this.twentyConfigService.get('MINTLIFY_SUBDOMAIN');

      if (!MINTLIFY_API_KEY) {
        return {
          success: false,
          message: 'Mintlify API key not configured',
          error:
            'The documentation search service is not properly configured. Please contact your administrator.',
        };
      }
      const response = await axios.post(
        `https://api-dsc.mintlify.com/v1/search/${MINTLIFY_SUBDOMAIN}`,
        {
          query,
          pageSize: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${MINTLIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const results = response.data;

      if (results.length === 0) {
        return {
          success: true,
          message: `No help articles found for "${query}"`,
          result: [],
        };
      }

      return {
        success: true,
        message: `Found ${results.length} relevant help article${results.length === 1 ? '' : 's'} for "${query}"`,
        result: results,
      };
    } catch (error) {
      const errorDetail = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
          ? error.message
          : 'Documentation search failed';

      return {
        success: false,
        message: `Failed to search help articles for "${query}"`,
        error: errorDetail,
      };
    }
  }
}
