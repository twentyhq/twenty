import { type ResendDomain } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain.type';
import { type ResendDomainRecord } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain-record.type';
import { mapResendDomainRecords } from 'src/engine/core-modules/emailing-domain/drivers/resend/utils/map-resend-domain-records.util';
import { type EmailingDomainVerificationCheck } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-verification-check.type';

const isGivenUpRecordStatus = (status: string | undefined): boolean => {
  switch (status) {
    case 'not_started':
    case 'failure':
    case 'failed':
      return true;
    default:
      return false;
  }
};

const findGivenUpCheck = ({
  records,
  recordLabel,
  name,
}: {
  records: ResendDomainRecord[];
  recordLabel: string;
  name: EmailingDomainVerificationCheck['name'];
}): EmailingDomainVerificationCheck[] => {
  const labelledRecords = records.filter(
    (record) => record.record.toUpperCase() === recordLabel,
  );

  if (!labelledRecords.some((record) => isGivenUpRecordStatus(record.status))) {
    return [];
  }

  return [{ name, records: mapResendDomainRecords(labelledRecords) }];
};

export const findResendGivenUpChecks = (
  domain: ResendDomain,
): EmailingDomainVerificationCheck[] => {
  const records = domain.records ?? [];

  return [
    ...findGivenUpCheck({ records, recordLabel: 'DKIM', name: 'DKIM' }),
    ...findGivenUpCheck({ records, recordLabel: 'SPF', name: 'MAIL_FROM' }),
  ];
};
