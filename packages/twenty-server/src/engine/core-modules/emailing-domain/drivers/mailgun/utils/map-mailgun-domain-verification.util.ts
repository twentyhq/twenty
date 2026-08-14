import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type MailgunDnsRecord } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/types/mailgun-api.type';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { type VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';

export const mapMailgunDomainState = (
  state: string | undefined,
): EmailingDomainStatus => {
  switch (state) {
    case 'active':
      return EmailingDomainStatus.VERIFIED;
    case 'disabled':
      return EmailingDomainStatus.FAILED;
    default:
      return EmailingDomainStatus.PENDING;
  }
};

const mapMailgunRecordStatus = (valid: string | undefined): string => {
  switch (valid) {
    case 'valid':
      return 'success';
    case 'invalid':
      return 'error';
    default:
      return 'pending';
  }
};

const isVerificationRecordType = (
  recordType: string | undefined,
): recordType is VerificationRecord['type'] => {
  return recordType === 'TXT' || recordType === 'CNAME' || recordType === 'MX';
};

export const mapMailgunDnsRecords = (
  records: MailgunDnsRecord[] | undefined,
  domainName: string,
): VerificationRecord[] => {
  return (records ?? [])
    .filter(
      (
        record,
      ): record is MailgunDnsRecord & {
        record_type: VerificationRecord['type'];
      } => isVerificationRecordType(record.record_type),
    )
    .map((record) => {
      const priority = Number(record.priority);

      return {
        type: record.record_type,
        key: isNonEmptyString(record.name) ? record.name : domainName,
        value: record.value ?? '',
        ...(isDefined(record.priority) && Number.isFinite(priority)
          ? { priority }
          : {}),
        status: mapMailgunRecordStatus(record.valid),
      };
    });
};
