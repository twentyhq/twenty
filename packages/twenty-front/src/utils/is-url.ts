import { isDefined } from './isDefined';

export const isURL = (url: string | undefined | null): boolean => {
  if (!isDefined(url)) {
    return false;
  }

  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\:\d+)?(\/[\w\-\.~%!$&'()*+,;=:@/]*)?(\?[;&a-z\-\_=\+%]+)?(#\S*)?$/i;

  return urlRegex.test(url);
};
