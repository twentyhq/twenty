import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { isUnsubscribeHostnameReady } from 'src/engine/core-modules/emailing-domain/drivers/utils/is-unsubscribe-hostname-ready.util';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export const getUnsubscribeBaseUrlOrThrow = (
  emailingDomain: EmailingDomainEntity,
): string => {
  if (!isUnsubscribeHostnameReady(emailingDomain)) {
    throw new EmailingDomainDriverException(
      `Cannot send email for ${emailingDomain.domain}: unsubscribe domain is not active (status: ${emailingDomain.unsubscribeHostnameStatus})`,
      EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
    );
  }

  return `https://${emailingDomain.unsubscribeHostname}`;
};
