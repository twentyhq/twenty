import { isNonEmptyString } from '@sniptt/guards';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { UnsubscribeHostnameStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/unsubscribe-hostname-status.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export const getUnsubscribeBaseUrl = (
  emailingDomain: EmailingDomainEntity,
): string => {
  if (
    emailingDomain.unsubscribeHostnameStatus !==
      UnsubscribeHostnameStatus.ACTIVE ||
    !isNonEmptyString(emailingDomain.unsubscribeHostname)
  ) {
    throw new EmailingDomainDriverException(
      `Cannot send email for ${emailingDomain.domain}: unsubscribe domain is not active (status: ${emailingDomain.unsubscribeHostnameStatus})`,
      EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
    );
  }

  return `https://${emailingDomain.unsubscribeHostname}`;
};
