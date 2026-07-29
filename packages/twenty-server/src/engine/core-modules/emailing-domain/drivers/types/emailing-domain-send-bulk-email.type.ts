import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';

export type EmailingDomainBulkEmailRecipient = {
  to: string;
  variables: Record<string, string>;
};

export type EmailingDomainBulkEmailContent = {
  from: string;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
  recipients: EmailingDomainBulkEmailRecipient[];
  replyTo?: string[];
  unsubscribeTopicId?: string;
};

export type EmailingDomainSendBulkEmailRequest = EmailingDomainBulkEmailContent & {
  workspaceId: string;
  domain: string;
  emailingDomain: EmailingDomainEntity;
};

export const EMAILING_DOMAIN_BULK_RECIPIENT_STATUS = {
  SENT: 'SENT',
  FAILED: 'FAILED',
  SUPPRESSED: 'SUPPRESSED',
} as const;

export type EmailingDomainBulkRecipientStatus =
  (typeof EMAILING_DOMAIN_BULK_RECIPIENT_STATUS)[keyof typeof EMAILING_DOMAIN_BULK_RECIPIENT_STATUS];

export type EmailingDomainBulkEmailRecipientResult = {
  to: string;
  status: EmailingDomainBulkRecipientStatus;
  messageId: string | null;
  error: string | null;
};

export type EmailingDomainSendBulkEmailResult = {
  results: EmailingDomainBulkEmailRecipientResult[];
};
