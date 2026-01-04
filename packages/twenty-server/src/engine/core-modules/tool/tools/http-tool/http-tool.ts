import { Injectable } from '@nestjs/common';

import axios, { type AxiosRequestConfig } from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { parseDataFromContentType } from 'twenty-shared/workflow';

import { HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { getSecureAdapter } from 'src/engine/core-modules/tool/utils/get-secure-axios-adapter.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class HttpTool implements Tool {
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  inputSchema = HttpRequestInputZodSchema;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async execute(
    parameters: ToolInput,
    _context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { url, method, headers, body } = parameters as HttpRequestInput;
    const headersCopy = { ...headers };
    const isMethodForBody = ['POST', 'PUT', 'PATCH'].includes(method);

    try {
      const axiosConfig: AxiosRequestConfig = {
        url,
        method: method,
        headers: headersCopy,
      };

      if (isMethodForBody && body) {
        const contentType = headers?.['content-type'];

        axiosConfig.data = parseDataFromContentType(body, contentType);
        if (isDefined(headersCopy) && contentType === 'multipart/form-data') {
          delete headersCopy['content-type'];
        }
      }

      const isSafeModeEnabled = this.twentyConfigService.get(
        'HTTP_TOOL_SAFE_MODE_ENABLED',
      );

      const axiosClient = isSafeModeEnabled
        ? axios.create({
            adapter: getSecureAdapter(),
          })
        : axios.create();

      const response = await axiosClient(axiosConfig);

      return {
        success: true,
        message: `HTTP ${method} request to ${url} completed successfully`,
        result: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: `HTTP ${method} request to ${url} failed`,
          error: error.response?.data || error.message || 'HTTP request failed',
        };
      }

      return {
        success: false,
        message: `HTTP ${method} request to ${url} failed`,
        error: error instanceof Error ? error.message : 'HTTP request failed',
      };
    }
  }
}
