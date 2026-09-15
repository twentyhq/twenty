import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';
import {
  type EmailingDomain,
  EmailingDomainStatus,
  UnsubscribeHostnameStatus,
} from '~/generated-metadata/graphql';
import { getColorByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusColor';
import { getTextByEmailingDomainStatus } from '~/pages/settings/emailing-domains/utils/getEmailingDomainStatusText';

type VerificationRecordGroupStatusDisplay = {
  label: string;
  color: ThemeColor;
};

const toStatusDisplay = (
  status: EmailingDomainStatus,
): VerificationRecordGroupStatusDisplay => ({
  label: getTextByEmailingDomainStatus(status),
  color: getColorByEmailingDomainStatus(status),
});

export const getVerificationRecordGroupStatusDisplay = ({
  groupKey,
  emailingDomain,
}: {
  groupKey: VerificationRecordGroupKey;
  emailingDomain: Pick<EmailingDomain, 'status' | 'unsubscribeHostnameStatus'>;
}): VerificationRecordGroupStatusDisplay => {
  switch (groupKey) {
    case 'AUTHENTICATION':
      return toStatusDisplay(emailingDomain.status);
    case 'DMARC':
      return { label: t`Not set`, color: 'gray' };
    case 'UNSUBSCRIBE':
      return toStatusDisplay(
        emailingDomain.unsubscribeHostnameStatus ===
          UnsubscribeHostnameStatus.ACTIVE
          ? EmailingDomainStatus.VERIFIED
          : EmailingDomainStatus.PENDING,
      );
  }
};
