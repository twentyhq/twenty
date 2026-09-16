// Both tools take the same input; they differ only in whether the mail leaves.
export const SEND_EMAIL_TOOL_NAME = 'send_email';
export const DRAFT_EMAIL_TOOL_NAME = 'draft_email';

export const EMAIL_TOOL_NAMES = [
  SEND_EMAIL_TOOL_NAME,
  DRAFT_EMAIL_TOOL_NAME,
] as const;

export const isEmailToolName = (toolName: string): boolean =>
  EMAIL_TOOL_NAMES.some((emailToolName) => emailToolName === toolName);
