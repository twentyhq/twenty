import { isDefined } from 'twenty-shared/utils';
import {
  type BodyType,
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
} from 'twenty-shared/workflow';

export const getBodyTypeFromHeaders = (
  headers?: Record<string, string>,
): BodyType | null => {
  if (!isDefined(headers)) return null;

  const headerEntries = Object.entries(headers);

  for (let i = headerEntries.length - 1; i >= 0; i--) {
    const [key, val] = headerEntries[i];
    if (key.toLowerCase() === 'content-type') {
      const match = Object.entries(CONTENT_TYPE_VALUES_HTTP_REQUEST)
        .filter(([bodyTypeKey]) => bodyTypeKey !== 'None')
        .find(
          ([, contentTypeVal]) => val.trim().toLowerCase() === contentTypeVal,
        );
      if (isDefined(match)) {
        const [bodyTypeKey] = match;
        return bodyTypeKey as BodyType;
      }
    }
  }

  return null;
};
