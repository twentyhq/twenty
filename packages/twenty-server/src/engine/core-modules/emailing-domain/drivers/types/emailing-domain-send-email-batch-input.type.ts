import { type EmailingDomainBatchRecipient } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-batch-recipient.type';
import { type EmailingDomainEmailTemplate } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-email-template.type';
import { type EmailingDomainSendKind } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-kind.type';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export type EmailingDomainSendEmailBatchInput = {
  sendKind: EmailingDomainSendKind;
  workspaceId: string;
  domain: string;
  from: string;
  replyTo?: string[];
  template: EmailingDomainEmailTemplate;
  recipients: EmailingDomainBatchRecipient[];
  unsubscribeTopicId?: string;
};

export type EmailingDomainSendEmailBatchRequest =
  EmailingDomainSendEmailBatchInput & {
    emailingDomain: EmailingDomainEntity;
  };
