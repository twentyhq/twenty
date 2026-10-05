import { type AxiosError } from 'axios';

import { isObject, isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const readErrorReason = (data: unknown): string | undefined => {
  if (!isObject(data)) {
    return undefined;
  }

  if ('message' in data && isString(data.message)) {
    return data.message;
  }

  if ('error' in data && isString(data.error)) {
    return data.error;
  }

  return undefined;
};

export const buildHelpCenterErrorDetail = (error: AxiosError): string => {
  const response = error.response;

  if (!isDefined(response)) {
    return error.message;
  }

  return `${readErrorReason(response.data) ?? error.message} (HTTP ${response.status})`;
};
