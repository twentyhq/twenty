import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

export const mapResendDomainStatus = (
  status: string | undefined,
): EmailingDomainStatus => {
  switch (status) {
    case 'verified':
      return EmailingDomainStatus.VERIFIED;
    case 'failure':
    case 'failed':
      return EmailingDomainStatus.FAILED;
    case 'temporary_failure':
      return EmailingDomainStatus.TEMPORARY_FAILURE;
    default:
      return EmailingDomainStatus.PENDING;
  }
};
