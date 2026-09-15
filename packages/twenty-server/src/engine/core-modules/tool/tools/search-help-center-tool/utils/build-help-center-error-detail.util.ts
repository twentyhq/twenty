import { type AxiosError } from 'axios';

import { isDefined } from 'twenty-shared/utils';

// The endpoint reports failures as `{ error: "..." }`, not `{ message: "..." }`,
// so reading only `message` dropped the reason and left the caller with a bare
// "Request failed with status code 429". Keep the status, and prefer whatever
// explanation the endpoint actually gave.
export const buildHelpCenterErrorDetail = (error: AxiosError): string => {
  const response = error.response;

  if (!isDefined(response)) {
    return error.message;
  }

  const data = response.data as
    | { message?: unknown; error?: unknown }
    | undefined;

  const reason =
    typeof data?.message === 'string'
      ? data.message
      : typeof data?.error === 'string'
        ? data.error
        : error.message;

  return `${reason} (HTTP ${response.status})`;
};
