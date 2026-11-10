import { type HttpEgressLambdaResponse } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/http-egress-lambda-response.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const restoreResultDuplicatingError = ({
  resultIsError,
  ...response
}: HttpEgressLambdaResponse): HttpEgressResponse =>
  resultIsError === true
    ? {
        ...response,
        toolOutput: {
          ...response.toolOutput,
          // On HTTP errors, error holds the response body although ToolOutput types it as a string.
          result: response.toolOutput.error as unknown as ToolOutput['result'],
        },
      }
    : response;
