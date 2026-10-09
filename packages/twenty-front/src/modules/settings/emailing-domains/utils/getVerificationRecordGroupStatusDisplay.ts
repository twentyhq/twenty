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
        emailingDomain.unsubscribeHostnameStatus ===
          UnsubscribeHostnameStatus.ACTIVE
          ? EmailingDomainStatus.VERIFIED
          : EmailingDomainStatus.PENDING,
      );
  }
};
