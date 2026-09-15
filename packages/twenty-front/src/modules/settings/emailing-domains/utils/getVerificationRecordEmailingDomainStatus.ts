import { EmailingDomainStatus } from '~/generated-metadata/graphql';

export const getVerificationRecordEmailingDomainStatus = (
  recordStatus: string | null | undefined,
): EmailingDomainStatus => {
  switch (recordStatus) {
    case 'success':
      return EmailingDomainStatus.VERIFIED;
    case 'error':
      return EmailingDomainStatus.FAILED;
    default:
      return EmailingDomainStatus.PENDING;
  }
};
