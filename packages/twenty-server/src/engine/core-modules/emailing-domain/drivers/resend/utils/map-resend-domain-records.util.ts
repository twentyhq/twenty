import { isDefined } from 'twenty-shared/utils';

import { type ResendDomainRecord } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain-record.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

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

const isVerificationRecordType = (
  type: string,
): type is VerificationRecord['type'] => {
  return type === 'TXT' || type === 'CNAME' || type === 'MX';
};

export const mapResendDomainRecords = (
  records: ResendDomainRecord[] | undefined,
): VerificationRecord[] => {
  return (records ?? [])
    .filter(
      (
        record,
      ): record is ResendDomainRecord & {
        type: VerificationRecord['type'];
      } => isVerificationRecordType(record.type),
    )
    .map((record) => ({
      type: record.type,
      key: record.name,
      value: record.value,
      ...(isDefined(record.priority) ? { priority: record.priority } : {}),
      status: mapResendRecordStatus(record.status),
    }));
};
