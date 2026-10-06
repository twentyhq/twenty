import { type ToolApproval } from 'twenty-shared/ai';

export const EMAIL_TOOL_APPROVALS = {
  send_email: { template: 'email', alternativeToolNames: ['draft_email'] },
  draft_email: { template: 'email', alternativeToolNames: ['send_email'] },
} satisfies Record<string, ToolApproval>;
