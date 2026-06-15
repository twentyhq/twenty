import {
  type EmailRecipients,
  type WorkflowSendEmailFiles,
} from 'twenty-shared/workflow';

export type EmailFormData = {
  connectedAccountId: string;
  recipients: Required<EmailRecipients>;
  subject: string;
  body: string;
  files: WorkflowSendEmailFiles;
  inReplyTo: string;
};
