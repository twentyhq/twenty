import { t } from '@lingui/core/macro';
import {
  type IconComponent,
  IconLogout,
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
    case 'UNSUBSCRIBE':
      return { Icon: IconLogout, title: t`Unsubscribe link` };
  }
};
