import { BODY_TYPES } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { isDefined } from 'twenty-shared/utils';
import {
  type BodyType,
  CONTENT_TYPE_VALUES_HTTP_REQUEST,
} from 'twenty-shared/workflow';

export const getBodyTypeFromHeaders = (
  headers?: Record<string, string>,
): BodyType | null => {
  if (!isDefined(headers) || !isDefined(headers['content-type'])) {
    return null;
  }

  const contentType = headers['content-type'];

  const match = Object.entries(CONTENT_TYPE_VALUES_HTTP_REQUEST).find(
    ([bodyTypeKey, contentTypeVal]) =>
      bodyTypeKey !== BODY_TYPES.NONE && contentType === contentTypeVal,
  );

  return isDefined(match) ? (match[0] as BodyType) : null;
};
