import { isDefined } from 'twenty-shared/utils';

import { type ResendDomainRecord } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-api.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

export const mapResendDomainStatus = (
  status: string | undefined,
): EmailingDomainStatus => {
  switch (status) {
    case 'verified':
      return EmailingDomainStatus.VERIFIED;
    case 'failure':
    case 'failed':
      return EmailingDomainStatus.FAILED;
    case 'temporary_failure':
      return EmailingDomainStatus.TEMPORARY_FAILURE;
    default:
      return EmailingDomainStatus.PENDING;
  }
};

const mapResendRecordStatus = (status: string | undefined): string => {
  switch (status) {
    case 'verified':
      return 'success';
    case 'failure':
    case 'failed':
      return 'error';
    default:
      return 'pending';
  }
};

export const mapResendDomainRecords = (
  records: ResendDomainRecord[] | undefined,
): VerificationRecord[] => {
  return (records ?? [])
    .filter(
      (record) =>
        record.type === 'TXT' ||
        record.type === 'CNAME' ||
        record.type === 'MX',
    )
    .map((record) => ({
      type: record.type as VerificationRecord['type'],
      key: record.name,
      value: record.value,
      ...(isDefined(record.priority) ? { priority: record.priority } : {}),
      status: mapResendRecordStatus(record.status),
    }));
};
