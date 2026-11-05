import {
  type EmailingDomain,
  EmailingDomainStatus,
  UnsubscribeHostnameStatus,
} from '~/generated-metadata/graphql';

export const getUnsubscribeHostnameDisplayStatus = (
  unsubscribeHostnameStatus: EmailingDomain['unsubscribeHostnameStatus'],
): EmailingDomainStatus => {
  switch (unsubscribeHostnameStatus) {
    case UnsubscribeHostnameStatus.ACTIVE:
      return EmailingDomainStatus.VERIFIED;
    case UnsubscribeHostnameStatus.FAILED:
      return EmailingDomainStatus.FAILED;
    default:
      return EmailingDomainStatus.PENDING;
  }
};
