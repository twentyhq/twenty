import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const formatBody = (body: unknown) => {
  if (!isDefined(body)) {
    return '';
  }

  return isString(body) ? body : JSON.stringify(body, null, 2);
};
