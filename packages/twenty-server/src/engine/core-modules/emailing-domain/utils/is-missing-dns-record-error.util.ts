import { isDefined } from 'twenty-shared/utils';

import { MISSING_DNS_RECORD_ERROR_CODES } from 'src/engine/core-modules/emailing-domain/constants/missing-dns-record-error-codes.constant';

export const isMissingDnsRecordError = (error: unknown): boolean => {
  if (!(error instanceof Error) || !('code' in error)) {
    return false;
  }

  const { code } = error;

  return (
    isDefined(code) && MISSING_DNS_RECORD_ERROR_CODES.includes(String(code))
  );
};
