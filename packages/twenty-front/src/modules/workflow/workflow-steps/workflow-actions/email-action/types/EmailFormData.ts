import { type WorkflowAttachmentType } from '@/workflow/workflow-steps/workflow-actions/email-action/types/WorkflowAttachmentType';
import { type EmailRecipients } from 'twenty-shared/workflow';

export type EmailFormData = {
  connectedAccountId: string;
  recipients: Required<EmailRecipients>;
  subject: string;
  body: string;
  files: WorkflowAttachmentType[];
};
