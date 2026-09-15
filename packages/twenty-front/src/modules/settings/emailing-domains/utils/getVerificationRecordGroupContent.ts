import { t } from '@lingui/core/macro';
import {
  type IconComponent,
  IconInbox,
  IconLogout,
  IconMail,
  IconShield,
  IconWorldWww,
} from 'twenty-ui/icon';

import { type VerificationRecordGroupKey } from '@/settings/emailing-domains/types/VerificationRecordGroupKey';

type VerificationRecordGroupContent = {
  Icon: IconComponent;
  title: string;
};

export const getVerificationRecordGroupContent = (
  groupKey: VerificationRecordGroupKey,
): VerificationRecordGroupContent => {
  switch (groupKey) {
    case 'AUTHENTICATION':
      return { Icon: IconWorldWww, title: t`Domain authentication` };
    case 'DMARC':
      return { Icon: IconShield, title: t`DMARC policy` };
    case 'RECEIVING':
      return { Icon: IconInbox, title: t`Receiving` };
    case 'UNSUBSCRIBE':
      return { Icon: IconLogout, title: t`Unsubscribe link` };
    case 'OTHER':
      return { Icon: IconMail, title: t`DNS records` };
  }
};
