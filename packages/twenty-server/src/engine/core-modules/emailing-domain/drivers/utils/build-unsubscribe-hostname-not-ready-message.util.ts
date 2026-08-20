import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export const buildUnsubscribeHostnameNotReadyMessage = (
  emailingDomain: EmailingDomainEntity,
): string =>
  `Cannot send email for ${emailingDomain.domain}: unsubscribe domain is not active (status: ${emailingDomain.unsubscribeHostnameStatus})`;
