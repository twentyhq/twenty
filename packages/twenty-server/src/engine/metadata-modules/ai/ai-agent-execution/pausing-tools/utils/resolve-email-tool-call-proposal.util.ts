import { type ProposeToolCallToolInput } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { ACTION_TOOL_LABELS } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';
import {
  findEmailArgumentsError,
  type ProposedToolCallResolution,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';

const EMAIL_TOOL_ALTERNATIVES = {
  send_email: 'draft_email',
  draft_email: 'send_email',
} as const;

const isEmailToolName = (
  toolName: string,
): toolName is keyof typeof EMAIL_TOOL_ALTERNATIVES =>
  Object.prototype.hasOwnProperty.call(EMAIL_TOOL_ALTERNATIVES, toolName);

// for proposers without registry tools (apps posting to the inbox, workflow steps without an agent):
// an email runs only once approved, with the approver's own permissions, so nothing is looked up here
export const resolveEmailToolCallProposal = (
  input: ProposeToolCallToolInput,
): ProposedToolCallResolution => {
  const { toolName } = input;

  if (!isEmailToolName(toolName)) {
    return {
      error: `Only send_email and draft_email can be proposed here, not "${toolName}".`,
    };
  }

  const emailArgumentsError = findEmailArgumentsError(input.arguments);

  if (isDefined(emailArgumentsError)) {
    return { error: emailArgumentsError };
  }

  return {
    proposal: {
      ...input,
      toolLabel: ACTION_TOOL_LABELS[toolName].label,
      template: 'email',
      alternativeToolNames: [EMAIL_TOOL_ALTERNATIVES[toolName]],
    },
  };
};
