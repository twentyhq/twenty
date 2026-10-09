import { t } from '@lingui/core/macro';
import { type ThemeColor } from 'twenty-ui/theme';

import { EmailingDomainStatus } from '~/generated-metadata/graphql';

export const getEmailingDomainStatusDisplay = (
  status: EmailingDomainStatus,
): { label: string; color: ThemeColor } => {
  switch (status) {
    case EmailingDomainStatus.VERIFIED:
      return { label: t`Verified`, color: 'turquoise' };
    case EmailingDomainStatus.PENDING:
      return { label: t`Pending`, color: 'orange' };
    case EmailingDomainStatus.TEMPORARY_FAILURE:
      return { label: t`Temporary Failure`, color: 'orange' };
    case EmailingDomainStatus.FAILED:
      return { label: t`Failed`, color: 'red' };
    default:
      return { label: t`Unknown`, color: 'gray' };
  }
};
