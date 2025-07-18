import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import axios, { AxiosRequestConfig } from 'axios';
import { JSONSchema7 } from 'json-schema';

import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { Tool } from 'src/engine/core-modules/tool/types/tool.type';

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
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  parameters: JSONSchema7 = {
    type: 'object',
    properties: {
      toolDescription: {
        type: 'string',
        description:
          'A clear, human-readable status message describing the HTTP request being made. This will be shown to the user while the tool is being called, so phrase it as a present-tense status update. Explain what endpoint you are calling and with what parameters in natural language.',
      },
      input: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to make the request to',
          },
          method: {
            type: 'string',
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            description: 'The HTTP method to use',
          },
          headers: {
            type: 'object',
            description: 'HTTP headers to include in the request',
            additionalProperties: { type: 'string' },
          },
          body: {
            type: 'object',
            description: 'Request body for POST, PUT, PATCH requests',
          },
        },
        required: ['url', 'method'],
      },
    },
    required: ['toolDescription', 'input'],
  };

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
