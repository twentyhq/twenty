import { isNumber, isObject } from '@sniptt/guards';

import { extractPdlErrorMessage } from 'src/logic-functions/utils/extract-pdl-error-message';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';

export const parsePdlItem = <TData>(item: unknown): PdlEnrichResult<TData> => {
  if (!isObject(item)) {
    return {
      outcome: 'error',
      httpStatus: 0,
      message: 'People Data Labs returned a malformed response item.',
    };
  }

  const record = item as Record<string, unknown>;
  const status = isNumber(record.status) ? record.status : 0;

  if (status === 404) {
    return { outcome: 'not_found', httpStatus: 404 };
  }

  if (status < 200 || status >= 300) {
    return {
      outcome: 'error',
      httpStatus: status,
      message: extractPdlErrorMessage({ json: record, httpStatus: status }),
    };
  }

  const likelihood = isNumber(record.likelihood) ? record.likelihood : undefined;

  return {
    outcome: 'matched',
    httpStatus: status,
    likelihood,
    data: (record.data ?? record) as TData,
  };
};
