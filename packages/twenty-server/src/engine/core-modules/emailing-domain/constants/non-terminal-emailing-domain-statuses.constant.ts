import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

export const NON_TERMINAL_EMAILING_DOMAIN_STATUSES = [
  EmailingDomainStatus.PENDING,
  EmailingDomainStatus.TEMPORARY_FAILURE,
];
