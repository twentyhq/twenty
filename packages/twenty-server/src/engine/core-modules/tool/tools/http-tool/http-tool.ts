import { Injectable } from '@nestjs/common';

import http from 'http';
import https from 'https';

import axios, { type AxiosRequestConfig } from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { parseDataFromContentType } from 'twenty-shared/workflow';

import { HttpToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpRequestInput } from 'src/engine/core-modules/tool/tools/http-tool/types/http-request-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { getSafeUrlIP } from 'src/engine/core-modules/tool/utils/get-safe-url-ip.util';

@Injectable()
export class HttpTool implements Tool {
  description =
    'Make an HTTP request to any URL with configurable method, headers, and body.';
  inputSchema = HttpToolParametersZodSchema;

  async execute(parameters: ToolInput): Promise<ToolOutput> {
    const { url, method, headers, body } = parameters as HttpRequestInput;
    const headersCopy = { ...headers };
    const isMethodForBody = ['POST', 'PUT', 'PATCH'].includes(method);

    try {
      const parsedUrl = new URL(url);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid URL protocol');
      }

      const safeUrlIP = await getSafeUrlIP(parsedUrl);

      const httpModule = parsedUrl.protocol === 'https:' ? https : http;

      const agent = new httpModule.Agent({
        lookup: (
          _hostname: string,
          options: { family?: number; hints?: number; all?: boolean },
          callback: (
            err: NodeJS.ErrnoException | null,
            address: string | { address: string; family: number }[],
            family?: number,
          ) => void,
        ) => {
          // Skip DNS - use pre-validated IP

          if (options.all) {
            callback(null, [
              { address: safeUrlIP, family: options.family || 4 },
            ]);
          } else {
            callback(null, safeUrlIP, options.family || 4);
          }
        },
        ...(parsedUrl.protocol === 'https:' && {
          servername: parsedUrl.hostname,
        }),
      });

      const axiosConfig: AxiosRequestConfig = {
        url,
        method: method,
        headers: headersCopy,
      };

      if (parsedUrl.protocol === 'http:') {
        axiosConfig.httpAgent = agent;
      } else {
        axiosConfig.httpsAgent = agent;
      }

      if (isMethodForBody && body) {
        const contentType = headers?.['content-type'];

        axiosConfig.data = parseDataFromContentType(body, contentType);
        if (isDefined(headersCopy) && contentType === 'multipart/form-data') {
          delete headersCopy['content-type'];
        }
      }

      const response = await axios(axiosConfig);

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
