import { OutboundMessageDomainStatus } from '~/generated/graphql';

export const getOutboundMessageDomainStatusColor = (
  status: OutboundMessageDomainStatus,
) => {
  switch (status) {
    case OutboundMessageDomainStatus.VERIFIED:
      return 'turquoise';
    case OutboundMessageDomainStatus.PENDING:
      return 'orange';
    default:
      return 'gray';
  }
};
