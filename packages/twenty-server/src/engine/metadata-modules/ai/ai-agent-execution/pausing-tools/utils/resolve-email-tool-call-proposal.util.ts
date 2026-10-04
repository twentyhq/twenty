import { type ProposeToolCallToolInput } from 'twenty-shared/ai';

import { ACTION_TOOL_LABELS } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';
import { EMAIL_TOOL_APPROVALS } from 'src/engine/core-modules/tool-provider/constants/email-tool-approvals.constant';
import { isEmailToolName } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-email-tool-name.util';
import { buildEmailProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/build-email-proposal.util';
import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-resolution.type';

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

  return buildEmailProposal({
    ...input,
    alternativeToolNames: EMAIL_TOOL_APPROVALS[toolName].alternativeToolNames,
    toolLabel: ACTION_TOOL_LABELS[toolName].label,
  });
};
