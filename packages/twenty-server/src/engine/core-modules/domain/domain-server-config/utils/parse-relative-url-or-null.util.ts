import { parseRelativeUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/parse-relative-url.util';

export const parseRelativeUrlOrNull = (
  relativeUrl: string,
): ReturnType<typeof parseRelativeUrl> | null => {
  try {
    return parseRelativeUrl(relativeUrl);
  } catch {
    return null;
  }
};
