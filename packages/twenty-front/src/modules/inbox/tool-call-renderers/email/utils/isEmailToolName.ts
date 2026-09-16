import { EMAIL_TOOL_NAMES } from '@/inbox/tool-call-renderers/email/constants/EmailToolNames';

export const isEmailToolName = (toolName: string): boolean =>
  EMAIL_TOOL_NAMES.some((emailToolName) => emailToolName === toolName);
