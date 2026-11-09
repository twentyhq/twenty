import { isObject, isString } from '@sniptt/guards';
import { type FilePart } from 'ai';
import { isDefined, isHttpUrl } from 'twenty-shared/utils';

const getFilePartUrl = (data: FilePart['data']): string | null => {
  if (isString(data)) {
    return data;
  }

  if (data instanceof URL) {
    return data.toString();
  }

  return isObject(data) && 'type' in data && data.type === 'url'
    ? data.url.toString()
    : null;
};

export const getFilePartHttpUrl = (part: FilePart): string | null => {
  const url = getFilePartUrl(part.data);

  return isDefined(url) && isHttpUrl(url) ? url : null;
};
