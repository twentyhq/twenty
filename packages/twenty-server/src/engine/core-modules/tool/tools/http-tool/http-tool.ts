import { Injectable } from '@nestjs/common';

import axios, { type AxiosRequestConfig } from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { parseDataFromContentType } from 'twenty-shared/workflow';

import { HttpToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
@Injectable()
export class HttpTool implements Tool {
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  parameters = HttpToolParametersZodSchema;

  async execute(parameters: ToolInput): Promise<ToolOutput> {
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

      const response = await axios(axiosConfig);

      return { result: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          error: error.response?.data || error.message || 'HTTP request failed',
        };
      }

      return {
        error: error instanceof Error ? error.message : 'HTTP request failed',
      };
    }
  }
}
