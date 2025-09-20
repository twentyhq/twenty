import { t } from '@lingui/core/macro';
import { OutboundMessageDomainStatus } from '~/generated/graphql';

export const getTextByOutboundMessageDomainStatus = (
  status: OutboundMessageDomainStatus,
) => {
  switch (status) {
    case OutboundMessageDomainStatus.VERIFIED:
      return t`Verified`;
    case OutboundMessageDomainStatus.PENDING:
      return t`Pending`;
    case OutboundMessageDomainStatus.TEMPORARY_FAILURE:
      return t`Temporary Failure`;
    case OutboundMessageDomainStatus.FAILED:
      return t`Failed`;
    default:
      return t`Unknown`;
  }
};
