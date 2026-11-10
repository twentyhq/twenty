import {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  isAxiosError,
} from 'axios';
import { isNull, isUndefined } from '@sniptt/guards';

import { describeOutboundRequestError } from 'src/engine/core-modules/secure-http-client/utils/describe-outbound-request-error.util';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';
import { parseDataFromContentType } from 'src/engine/core-modules/tool/tools/http-tool/utils/parse-data-from-content-type.util';
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

// Bundled into the HTTP egress Lambda: keep its imports framework-free.
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

    if (
      METHODS_WITH_BODY.includes(method) &&
      !isNull(body) &&
      !isUndefined(body)
    ) {
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
      outcomeDetails: {
        outcome: 'success',
        status: response.status,
        durationMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    return {
      toolOutput: buildErrorToolOutput({ error, request }),
      outcomeDetails: {
        ...describeOutboundRequestError(error),
        durationMs: Date.now() - startedAt,
      },
    };
  }
};
