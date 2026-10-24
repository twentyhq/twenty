import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import {
  type EmailingDomain,
  EmailingDomainStatus,
  UnsubscribeHostnameStatus,
} from '~/generated-metadata/graphql';
import { getEmailingDomainStatusDisplay } from '@/settings/emailing-domains/utils/getEmailingDomainStatusDisplay';

type EmailingDomainSetupStatusDisplay = {
  label: string;
  color: ThemeColor;
  tooltip?: {
    content: string;
    description: string;
  };
};

export const getEmailingDomainSetupStatusDisplay = (
  emailingDomain: Pick<EmailingDomain, 'status' | 'unsubscribeHostnameStatus'>,
): EmailingDomainSetupStatusDisplay => {
  switch (emailingDomain.status) {
    case EmailingDomainStatus.VERIFIED:
      if (
        emailingDomain.unsubscribeHostnameStatus ===
        UnsubscribeHostnameStatus.ACTIVE
      ) {
        return getEmailingDomainStatusDisplay(emailingDomain.status);
      }

      return {
        label: t`1 of 2 done`,
        color: 'orange',
        tooltip: {
          content: t`Unsubscribe record not verified`,
          description: t`Emails can be sent. Add the unsubscribe record to send campaigns.`,
        },
      };
    default:
      return getEmailingDomainStatusDisplay(emailingDomain.status);
  }
};
