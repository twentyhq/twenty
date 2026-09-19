import { SEND_EMAIL_TOOL_NAME } from '@/inbox/tool-call-renderers/email/constants/SendEmailToolName';

export const isEmailToolName = (toolName: string): boolean =>
  toolName === SEND_EMAIL_TOOL_NAME;
