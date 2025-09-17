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
    default:
      return t`Unknown`;
  }
};
