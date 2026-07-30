import { type RoutePayload } from 'twenty-sdk/define';

import { RECOMPUTE_BATCH_SIZE } from 'src/constants/recompute-batch-size';
import {
  isRecomputeTargetName,
  type RecomputeTargetName,
} from 'src/types/recompute-target';

export type RecomputeRequest = {
  objectNameSingular: RecomputeTargetName;
  recordIds: string[];
};

export type RecomputeRouteBody = {
  objectNameSingular?: unknown;
  recordIds?: unknown;
};

export type RecomputeInput =
  | RecomputeRequest
  | RoutePayload<RecomputeRouteBody>;

export type ParseResult =
  | { isValid: true; request: RecomputeRequest }
  | { isValid: false; message: string };

const isRoutePayload = (
  input: RecomputeInput,
): input is RoutePayload<RecomputeRouteBody> =>
  typeof input === 'object' && input !== null && 'requestContext' in input;

export const parseRecomputeRequest = (input: RecomputeInput): ParseResult => {
  const body = isRoutePayload(input) ? (input.body ?? {}) : input;
  const { objectNameSingular, recordIds } = body as RecomputeRouteBody;

  if (!isRecomputeTargetName(objectNameSingular)) {
    return {
      isValid: false,
      message:
        'objectNameSingular must be one of "person", "company" or "opportunity"',
    };
  }

  if (!Array.isArray(recordIds)) {
    return { isValid: false, message: 'recordIds must be an array' };
  }

  const uniqueRecordIds = [
    ...new Set(
      recordIds.filter(
        (recordId): recordId is string =>
          typeof recordId === 'string' && recordId.length > 0,
      ),
    ),
  ];

  if (uniqueRecordIds.length !== recordIds.length) {
    return {
      isValid: false,
      message: 'recordIds must contain unique non-empty strings',
    };
  }

  if (uniqueRecordIds.length > RECOMPUTE_BATCH_SIZE) {
    return {
      isValid: false,
      message: `recordIds must contain at most ${RECOMPUTE_BATCH_SIZE} ids`,
    };
  }

  return {
    isValid: true,
    request: { objectNameSingular, recordIds: uniqueRecordIds },
  };
};
