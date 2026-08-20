import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { buildUnsubscribeHostnameNotReadyMessage } from 'src/engine/core-modules/emailing-domain/drivers/utils/build-unsubscribe-hostname-not-ready-message.util';
import { isUnsubscribeHostnameReady } from 'src/engine/core-modules/emailing-domain/drivers/utils/is-unsubscribe-hostname-ready.util';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export const getUnsubscribeBaseUrlOrThrow = (
  emailingDomain: EmailingDomainEntity,
): string => {
  if (!isUnsubscribeHostnameReady(emailingDomain)) {
    throw new EmailingDomainDriverException(
      buildUnsubscribeHostnameNotReadyMessage(emailingDomain),
      EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
    );
  }

  return `https://${emailingDomain.unsubscribeHostname}`;
};
