import { type SettingsEmailingDomainVerificationRecord } from '@/settings/emailing-domains/types/SettingsEmailingDomainVerificationRecord';
import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';
import { VerificationRecordPurpose } from '~/generated-metadata/graphql';

export const getVerificationRecordGroupKey = (
  record: SettingsEmailingDomainVerificationRecord,
): VerificationRecordGroupKey => {
  switch (record.purpose) {
    case VerificationRecordPurpose.DKIM:
    case VerificationRecordPurpose.MAIL_FROM:
      return 'AUTHENTICATION';
    case VerificationRecordPurpose.DMARC:
      return 'DMARC';
    case VerificationRecordPurpose.RECEIVING:
      return 'RECEIVING';
    case VerificationRecordPurpose.UNSUBSCRIBE:
      return 'UNSUBSCRIBE';
    default:
      return 'OTHER';
  }
};
