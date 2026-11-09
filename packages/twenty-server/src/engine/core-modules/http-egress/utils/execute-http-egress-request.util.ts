import {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  isAxiosError,
} from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { parseDataFromContentType } from 'twenty-shared/workflow';

import { type HttpEgressRequest } from 'src/engine/core-modules/http-egress/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/http-egress/types/http-egress-response.type';
import { classifyHttpEgressError } from 'src/engine/core-modules/http-egress/utils/classify-http-egress-error.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

const buildErrorToolOutput = ({
  error,
  request: { input, limits },
}: {
  error: unknown;
  request: HttpEgressRequest;
}): ToolOutput => {
  const message = `HTTP ${input.method} request to ${input.url} failed`;

  if (!isAxiosError(error)) {
    return {
      success: false,
      message,
      error: error instanceof Error ? error.message : 'HTTP request failed',
    };
  }

  const isTimeout =
    error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED';
  const errorMessage = isTimeout
    ? `Request timed out after ${limits.timeoutMs / 1_000}s`
    : error.message;

  return {
    success: false,
    message,
    error: error.response?.data || errorMessage || 'HTTP request failed',
    status: error.response?.status,
    statusText: error.response?.statusText,
    headers: error.response?.headers as Record<string, string> | undefined,
    result: error.response?.data,
  };
};

export const executeHttpEgressRequest = async (
  request: HttpEgressRequest,
  httpClient: AxiosInstance,
): Promise<HttpEgressResponse> => {
  const { url, method, headers, body } = request.input;
  const startedAt = Date.now();
  const headersCopy = new AxiosHeaders(headers);

  try {
    const axiosConfig: AxiosRequestConfig = {
      url,
      method,
      headers: headersCopy,
      timeout: request.limits.timeoutMs,
      maxContentLength: request.limits.maxPayloadSizeBytes,
      maxBodyLength: request.limits.maxPayloadSizeBytes,
    };

    if (METHODS_WITH_BODY.includes(method) && isDefined(body)) {
      const contentType = headersCopy.getContentType()?.toString();

      axiosConfig.data = parseDataFromContentType(body, contentType);

      if (contentType === 'multipart/form-data') {
        headersCopy.delete('Content-Type');
      }
    }

    const response = await httpClient(axiosConfig);

    return {
      toolOutput: {
        success: true,
        message: `HTTP ${method} request to ${url} completed successfully`,
        result: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      },
      diagnostics: {
        outcome: 'success',
        status: response.status,
        resolvedAddress: response.request?.socket?.remoteAddress,
        durationMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    return {
      toolOutput: buildErrorToolOutput({ error, request }),
      diagnostics: {
        ...classifyHttpEgressError(error),
        durationMs: Date.now() - startedAt,
      },
    };
  }
};
