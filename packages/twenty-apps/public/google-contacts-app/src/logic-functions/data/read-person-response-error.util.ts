import { isDefined } from 'twenty-sdk/utils';

import { type PersonResponse } from 'src/logic-functions/types/google-response.type';

export const readPersonResponseError = (
  personResponse: PersonResponse | undefined,
): string | undefined => {
  if (!isDefined(personResponse)) {
    return 'missing from the batch response';
  }

  const statusCode = personResponse.status?.code ?? 0;

  return statusCode === 0
    ? undefined
    : (personResponse.status?.message ?? `status code ${statusCode}`);
};
