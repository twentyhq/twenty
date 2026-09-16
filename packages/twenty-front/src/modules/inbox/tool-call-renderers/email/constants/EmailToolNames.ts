import { DRAFT_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/DraftEmailToolName';
import { SEND_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/SendEmailToolName';

// Both tools take the same input; they differ only in whether the mail leaves.
export const EMAIL_TOOL_NAMES = [
  SEND_EMAIL_TOOL_NAME,
  DRAFT_EMAIL_TOOL_NAME,
] as const;
