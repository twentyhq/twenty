import { getVerificationRecordGroupKey } from '@/settings/emailing-domains/utils/getVerificationRecordGroupKey';
import {
  type EmailingDomain,
  UnsubscribeHostnameStatus,
} from '~/generated-metadata/graphql';

export const isUnsubscribeVerificationPending = ({
  emailingDomain,
  isMessageCampaignEnabled,
}: {
  emailingDomain: Pick<
    EmailingDomain,
    'domain' | 'unsubscribeHostnameStatus' | 'verificationRecords'
  >;
  isMessageCampaignEnabled: boolean;
}): boolean => {
  const hasUnsubscribeRecords = (emailingDomain.verificationRecords ?? []).some(
    (record) =>
      getVerificationRecordGroupKey({
        recordName: record.key,
        domain: emailingDomain.domain,
      }) === 'UNSUBSCRIBE',
  );

  return (
    isMessageCampaignEnabled &&
    hasUnsubscribeRecords &&
    emailingDomain.unsubscribeHostnameStatus !==
      UnsubscribeHostnameStatus.ACTIVE
  );
};
