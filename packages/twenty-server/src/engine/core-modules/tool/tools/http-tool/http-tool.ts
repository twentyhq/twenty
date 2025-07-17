import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import axios, { AxiosRequestConfig } from 'axios';

import {
  Tool,
  ToolInput,
  ToolOutput,
} from 'src/engine/core-modules/tool/interfaces/tool.interface';

export type HttpToolParameters = {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?:
    | Record<
        string,
        | string
        | number
        | boolean
        | null
        | undefined
        | Array<string | number | boolean | null>
      >
    | string;
};

@Injectable()
export class HttpTool implements Tool {
  async execute(input: ToolInput): Promise<ToolOutput> {
    const { url, method, headers, body } =
      input.parameters as HttpToolParameters;

    try {
      const axiosConfig: AxiosRequestConfig = {
        url,
        method: method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        const parsedBody = isString(body) ? JSON.parse(body) : body;

        axiosConfig.data = parsedBody;
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
