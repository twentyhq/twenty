import { type EmailingDomainSendEmailBatchInput } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-batch-input.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export type EmailingDomainSendEmailBatchRequest =
  EmailingDomainSendEmailBatchInput & {
    emailingDomain: EmailingDomainEntity;
  };
