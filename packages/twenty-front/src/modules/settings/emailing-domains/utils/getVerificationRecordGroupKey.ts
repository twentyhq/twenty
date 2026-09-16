import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';

export const getVerificationRecordGroupKey = ({
  recordName,
  domain,
}: {
  recordName: string;
  domain: string;
}): VerificationRecordGroupKey => {
  if (recordName === `_dmarc.${domain}`) {
    return 'DMARC';
  }

  if (recordName.endsWith(`unsubscribe.${domain}`)) {
    return 'UNSUBSCRIBE';
  }

  return 'AUTHENTICATION';
};
