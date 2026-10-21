import { isObject } from '@sniptt/guards';

import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';

// Checked structurally: URL's TypeError can come from another realm, where instanceof fails
const isInvalidUrlError = (error: unknown) =>
  isObject(error) &&
  'name' in error &&
  error.name === 'TypeError' &&
  'code' in error &&
  error.code === 'ERR_INVALID_URL';

export const parseRelativeUrlOrNull = (
  relativeUrl: string,
): ReturnType<typeof parseRelativeUrl> | null => {
  try {
    return parseRelativeUrl(relativeUrl);
  } catch (error) {
    if (isInvalidUrlError(error)) {
      return null;
    }

    throw error;
  }
};
