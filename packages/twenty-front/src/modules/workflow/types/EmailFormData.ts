import {
  type EmailRecipients,
  type WorkflowAttachment,
} from 'twenty-shared/workflow';

export type EmailFormData = {
  connectedAccountId: string;
  recipients: Required<EmailRecipients>;
  subject: string;
  body: string;
  files: WorkflowAttachment[];
};
