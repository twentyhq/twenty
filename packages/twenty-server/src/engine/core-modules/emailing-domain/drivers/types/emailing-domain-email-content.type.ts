import { type EmailingDomainAttachment } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-attachment.type';
import { type EmailingDomainHeader } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-header.type';

export type EmailingDomainEmailContent = {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string[];
  attachments?: EmailingDomainAttachment[];
  headers?: EmailingDomainHeader[];
  // When an email is sent under a topic, recipients who unsubscribed from that
  // topic are dropped in addition to the globally suppressed ones, and the
  // unsubscribe link is scoped to the topic.
  unsubscribeTopicId?: string;
};
