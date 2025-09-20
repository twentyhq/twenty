import { OutboundMessageDomainStatus } from '~/generated/graphql';

export const getColorByOutboundMessageDomainStatus = (
  status: OutboundMessageDomainStatus,
) => {
  switch (status) {
    case OutboundMessageDomainStatus.VERIFIED:
      return 'turquoise';
    case OutboundMessageDomainStatus.PENDING:
      return 'orange';
    case OutboundMessageDomainStatus.TEMPORARY_FAILURE:
      return 'orange';
    case OutboundMessageDomainStatus.FAILED:
      return 'red';
    default:
      return 'gray';
  }
};
