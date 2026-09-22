import { isNonEmptyString } from '@sniptt/guards';

import { type GraphErrorBody } from 'src/features/transcripts/logic-functions/types/graph-error-body.type';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';

export const buildGraphRequestError = async (
  response: Response,
): Promise<GraphRequestError> => {
  const body: GraphErrorBody = await response.json().catch(() => ({}));
  const errorCode = isNonEmptyString(body.error?.code)
    ? body.error.code
    : undefined;
  const innerErrorCode = isNonEmptyString(body.error?.innerError?.code)
    ? body.error.innerError.code
    : undefined;
  const message = isNonEmptyString(body.error?.message)
    ? body.error.message
    : response.statusText;

  return new GraphRequestError({
    message: `Microsoft Graph request failed (${response.status}${isNonEmptyString(innerErrorCode) ? ` ${innerErrorCode}` : ''}): ${message}`,
    status: response.status,
    errorCode,
    innerErrorCode,
  });
};
