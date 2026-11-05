import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';
import { type EmailingDomain } from '~/generated-metadata/graphql';
import { getEmailingDomainStatusDisplay } from '@/settings/emailing-domains/utils/getEmailingDomainStatusDisplay';
import { getUnsubscribeHostnameDisplayStatus } from '@/settings/emailing-domains/utils/getUnsubscribeHostnameDisplayStatus';

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
        getUnsubscribeHostnameDisplayStatus(
          emailingDomain.unsubscribeHostnameStatus,
        ),
      );
  }
};
