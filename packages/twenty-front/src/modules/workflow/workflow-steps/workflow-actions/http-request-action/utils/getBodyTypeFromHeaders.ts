import {
  BodyType,
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
} from 'twenty-shared/workflow';

export const getBodyTypeFromHeaders = (
  headers?: Record<string, string>,
): BodyType | null => {
  if (!headers) return null;

  const headerEntries = Object.entries(headers);

  for (let i = headerEntries.length - 1; i >= 0; i--) {
    const [key, val] = headerEntries[i];
    if (key.toLowerCase() === 'content-type') {
      const match = Object.entries(CONTENT_TYPE_VALUES_HTTP_REQUEST).find(
        ([bodyTypeKey, contentTypeVal]) =>
          val.toLowerCase().includes(contentTypeVal),
      );
      if (match) {
        const [bodyTypeKey] = match;
        return bodyTypeKey as BodyType;
      }
    }
  }

  return null;
};
