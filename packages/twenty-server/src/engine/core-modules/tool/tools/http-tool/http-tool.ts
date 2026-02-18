import { Injectable } from '@nestjs/common';

import { type AxiosRequestConfig, isAxiosError } from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { parseDataFromContentType } from 'twenty-shared/workflow';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class HttpTool implements Tool {
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  inputSchema = HttpRequestInputZodSchema;

  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
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

      const axiosClient = this.secureHttpClientService.getHttpClient(
        undefined,
        {
          workspaceId: context.workspaceId,
          userId: context.userId,
          source: 'workflow-http',
        },
      );
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
      if (isAxiosError(error)) {
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
