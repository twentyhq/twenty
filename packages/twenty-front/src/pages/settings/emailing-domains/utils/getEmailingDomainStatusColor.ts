import { EmailingDomainStatus } from '~/generated/graphql';

export const getColorByEmailingDomainStatus = (
  status: EmailingDomainStatus,
) => {
  switch (status) {
    case EmailingDomainStatus.VERIFIED:
      return 'turquoise';
    case EmailingDomainStatus.PENDING:
      return 'orange';
    case EmailingDomainStatus.TEMPORARY_FAILURE:
      return 'orange';
    case EmailingDomainStatus.FAILED:
      return 'red';
    default:
      return 'gray';
  }
};
