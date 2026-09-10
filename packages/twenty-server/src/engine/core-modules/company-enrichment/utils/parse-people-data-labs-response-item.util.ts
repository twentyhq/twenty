import { isNumber } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type PeopleDataLabsResponseItemParseResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-response-item-parse-result.type';
import { extractPeopleDataLabsErrorMessage } from 'src/engine/core-modules/company-enrichment/utils/extract-people-data-labs-error-message.util';

const ASSUMED_SUCCESS_STATUS_WHEN_MISSING = 200;

const ENVELOPE_FIELD_NAMES = new Set(['status', 'likelihood']);

const extractMatchedData = (
  responseItem: Record<string, unknown>,
): Record<string, unknown> => {
  if (isPlainObject(responseItem.data)) {
    return responseItem.data;
  }

  return Object.fromEntries(
    Object.entries(responseItem).filter(
      ([fieldName]) => !ENVELOPE_FIELD_NAMES.has(fieldName),
    ),
  );
};

export const parsePeopleDataLabsResponseItem = <TData>({
  item,
  requestedMinLikelihood,
}: {
  item: unknown;
  requestedMinLikelihood?: number;
}): PeopleDataLabsResponseItemParseResult<TData> => {
  if (!isPlainObject(item)) {
    return {
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    };
  }

  const httpStatus = isNumber(item.status)
    ? item.status
    : ASSUMED_SUCCESS_STATUS_WHEN_MISSING;

  if (httpStatus === 404) {
    return { outcome: 'notFound', httpStatus: 404 };
  }

  if (httpStatus < 200 || httpStatus >= 300) {
    return {
      outcome: 'error',
      httpStatus,
      message: extractPeopleDataLabsErrorMessage({
        json: item,
        httpStatus,
      }),
    };
  }

  const matchedData = extractMatchedData(item);

  if (Object.keys(matchedData).length === 0) {
    return { outcome: 'notFound', httpStatus };
  }

  const matchLikelihood = isNumber(item.likelihood)
    ? item.likelihood
    : undefined;

  const isMatchBelowRequestedThreshold =
    isDefined(requestedMinLikelihood) &&
    isDefined(matchLikelihood) &&
    matchLikelihood < requestedMinLikelihood;

  if (isMatchBelowRequestedThreshold) {
    return { outcome: 'notFound', httpStatus };
  }

  return {
    outcome: 'matched',
    httpStatus,
    likelihood: matchLikelihood,
    data: matchedData as TData,
  };
};
