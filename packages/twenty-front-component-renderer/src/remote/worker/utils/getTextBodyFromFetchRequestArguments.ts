import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isRequestObject } from '@/remote/worker/utils/isRequestObject';
import { isTextContentType } from '@/remote/worker/utils/isTextContentType';

const getRequestInputBody = async (
  input: Request,
): Promise<string | undefined> => {
  const requestBody = await input.clone().text();

  if (!isNonEmptyString(requestBody)) {
    return undefined;
  }

  const contentType = input.headers.get('content-type');

  if (isDefined(contentType) && !isTextContentType(contentType)) {
    throw new TypeError(
      `The front component fetch bridge only supports text request bodies for Twenty API requests, got content type: ${contentType}`,
    );
  }

  return requestBody;
};

export const getTextBodyFromFetchRequestArguments = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Promise<string | undefined> => {
  const initBody = init?.body;

  if (!isDefined(initBody)) {
    if (isRequestObject(input)) {
      return getRequestInputBody(input);
    }

    return undefined;
  }

  if (isString(initBody)) {
    return initBody;
  }

  if (initBody instanceof URLSearchParams) {
    return initBody.toString();
  }

  throw new TypeError(
    'The front component fetch bridge only supports string and URLSearchParams request bodies for Twenty API requests',
  );
};
