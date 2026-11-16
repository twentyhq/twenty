import { isNonEmptyString } from '@sniptt/guards';
import { type z } from 'zod';

import { HTTP_TOOL_BINARY_RESPONSE_WARNING } from 'src/engine/core-modules/tool/tools/http-tool/constants/http-tool-binary-response-warning.constant';
import { type HttpRequestInputZodSchema } from 'src/engine/core-modules/tool/tools/http-tool/http-tool.schema';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const TEXT_CONTENT_TYPE_PATTERN =
  /^text\/|[/+](json|xml|javascript|x-www-form-urlencoded)\b/i;

const isBinaryContentType = (contentType: string | undefined) =>
  isNonEmptyString(contentType) && !TEXT_CONTENT_TYPE_PATTERN.test(contentType);

// The tool returns the response body as result, and as error on failures, whatever ToolOutput declares.
export const buildHttpToolOutput = ({
  input,
  response,
}: {
  input: z.infer<typeof HttpRequestInputZodSchema>;
  response: HttpEgressResponse;
}): ToolOutput => {
  const result = response.body as ToolOutput['result'];

  if (response.outcomeDetails.outcome === 'success') {
    return {
      success: true,
      message: `HTTP ${input.method} request to ${input.url} completed successfully`,
      result,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      warnings: isBinaryContentType(response.headers?.['content-type'])
        ? [HTTP_TOOL_BINARY_RESPONSE_WARNING]
        : undefined,
    };
  }

  return {
    success: false,
    message: `HTTP ${input.method} request to ${input.url} failed`,
    error:
      (response.body as ToolOutput['error']) ||
      response.errorMessage ||
      'HTTP request failed',
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    result,
  };
};
