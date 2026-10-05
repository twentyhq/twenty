import { EMAIL_TOOL_APPROVALS } from 'src/engine/core-modules/tool-provider/constants/email-tool-approvals.constant';

export const isEmailToolName = (
  toolName: string,
): toolName is keyof typeof EMAIL_TOOL_APPROVALS =>
  Object.prototype.hasOwnProperty.call(EMAIL_TOOL_APPROVALS, toolName);
