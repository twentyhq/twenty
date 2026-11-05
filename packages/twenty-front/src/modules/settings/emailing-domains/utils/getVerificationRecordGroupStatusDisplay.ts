import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';
import {
  type EmailingDomain,
  EmailingDomainStatus,
  UnsubscribeHostnameStatus,
} from '~/generated-metadata/graphql';
import { getEmailingDomainStatusDisplay } from '@/settings/emailing-domains/utils/getEmailingDomainStatusDisplay';

type VerificationRecordGroupStatusDisplay = {
  label: string;
  color: ThemeColor;
};

const getUnsubscribeHostnameDisplayStatus = (
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

export const getVerificationRecordGroupStatusDisplay = ({
  groupKey,
  emailingDomain,
}: {
  groupKey: VerificationRecordGroupKey;
  emailingDomain: Pick<EmailingDomain, 'status' | 'unsubscribeHostnameStatus'>;
}): VerificationRecordGroupStatusDisplay => {
  switch (groupKey) {
    case 'AUTHENTICATION':
      return getEmailingDomainStatusDisplay(emailingDomain.status);
    case 'DMARC':
      return { label: t`Not set`, color: 'gray' };
    case 'UNSUBSCRIBE':
      return getEmailingDomainStatusDisplay(
        getUnsubscribeHostnameDisplayStatus(
          emailingDomain.unsubscribeHostnameStatus,
        ),
      );
  }
};
