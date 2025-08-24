import { Injectable } from '@nestjs/common';

import axios, { type AxiosRequestConfig } from 'axios';
import {
  bodyParsersHttpRequestStep,
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
} from 'twenty-shared/workflow';

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
    const { url, method, headers, body, bodyType } =
      parameters as HttpRequestInput;

    const isMethodForBody = ['POST', 'PUT', 'PATCH'].includes(method);

    try {
      const axiosConfig: AxiosRequestConfig = {
        url,
        method: method,
        headers,
      };

      if (isMethodForBody && body) {
        axiosConfig.data = bodyParsersHttpRequestStep(bodyType, body);
        const hasContentTypeHeader =
          headers &&
          Object.keys(headers).some(
            (key) => key.toLowerCase() === 'content-type',
          );

        const isFormData = bodyType === 'FormData';
        const isNoneType = bodyType === 'None';
        const shouldSetContentType =
          !hasContentTypeHeader && !isFormData && !isNoneType;

        const contentTypeValue = bodyType
          ? CONTENT_TYPE_VALUES_HTTP_REQUEST[bodyType] || 'application/json'
          : 'application/json';

        if (shouldSetContentType) {
          axiosConfig.headers = {
            ...axiosConfig.headers,
            'content-type': contentTypeValue,
          };
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
