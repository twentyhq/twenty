import { isNonEmptyString } from '@sniptt/guards';

import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export const isUnsubscribeHostnameReady = (
  emailingDomain: EmailingDomainEntity,
): boolean =>
  emailingDomain.unsubscribeHostnameStatus ===
    UnsubscribeHostnameStatus.ACTIVE &&
  isNonEmptyString(emailingDomain.unsubscribeHostname);
