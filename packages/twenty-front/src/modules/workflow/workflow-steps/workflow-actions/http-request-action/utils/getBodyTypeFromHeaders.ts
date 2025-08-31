import { isDefined } from 'twenty-shared/utils';
import {
  type BodyType,
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
} from 'twenty-shared/workflow';

export const getBodyTypeFromHeaders = (
  headers?: Record<string, string>,
): BodyType | null => {
  if (!isDefined(headers)||!isDefined(headers["content-type"])) return null;

  const contentType = headers["content-type"];


  const match = Object.entries(CONTENT_TYPE_VALUES_HTTP_REQUEST).find(
    ([bodyTypeKey, contentTypeVal]) =>
      bodyTypeKey !== 'None' && contentType === contentTypeVal,
  );

  return isDefined(match) ? (match[0] as BodyType) : null;

};
