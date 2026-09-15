import { t } from '@lingui/core/macro';
import {
  type IconComponent,
  IconInbox,
  IconKey,
  IconMail,
  IconMailX,
  IconShield,
} from 'twenty-ui/icon';

import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';

type VerificationRecordGroupContent = {
  Icon: IconComponent;
  title: string;
  description: string;
};

export const getVerificationRecordGroupContent = (
  groupKey: VerificationRecordGroupKey,
): VerificationRecordGroupContent => {
  switch (groupKey) {
    case 'AUTHENTICATION':
      return {
        Icon: IconKey,
        title: t`Domain authentication`,
        description: t`Proves that emails from this domain come from you and routes bounces back to Twenty.`,
      };
    case 'DMARC':
      return {
        Icon: IconShield,
        title: t`DMARC policy`,
        description: t`Tells inboxes what to do with emails that fail these checks.`,
      };
    case 'RECEIVING':
      return {
        Icon: IconInbox,
        title: t`Receiving`,
        description: t`Lets this domain receive emails through your provider.`,
      };
    case 'UNSUBSCRIBE':
      return {
        Icon: IconMailX,
        title: t`Unsubscribe link`,
        description: t`Hosts the unsubscribe link of your campaigns.`,
      };
    case 'OTHER':
      return {
        Icon: IconMail,
        title: t`DNS records`,
        description: t`Add these records at your DNS provider.`,
      };
  }
};
