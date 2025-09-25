import { t } from '@lingui/core/macro';
import { EmailingDomainStatus } from '~/generated/graphql';

export const getTextByEmailingDomainStatus = (status: EmailingDomainStatus) => {
  switch (status) {
    case EmailingDomainStatus.VERIFIED:
      return t`Verified`;
    case EmailingDomainStatus.PENDING:
      return t`Pending`;
    case EmailingDomainStatus.TEMPORARY_FAILURE:
      return t`Temporary Failure`;
    case EmailingDomainStatus.FAILED:
      return t`Failed`;
    default:
      return t`Unknown`;
  }
};
