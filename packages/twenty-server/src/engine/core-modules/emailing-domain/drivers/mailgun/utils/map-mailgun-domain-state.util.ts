/* @license Enterprise */

import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';

export const mapMailgunDomainState = (
  state: string | undefined,
): EmailingDomainStatus => {
  switch (state) {
    case 'active':
      return EmailingDomainStatus.VERIFIED;
    case 'disabled':
      return EmailingDomainStatus.FAILED;
    default:
      return EmailingDomainStatus.PENDING;
  }
};
