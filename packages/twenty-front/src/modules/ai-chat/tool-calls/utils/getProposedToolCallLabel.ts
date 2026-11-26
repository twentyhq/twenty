import { t } from '@lingui/core/macro';
import { type ProposedToolCall } from 'twenty-shared/ai';

import { EMAIL_TOOL_NAMES } from '@/ai-chat/tool-calls/constants/EmailToolNames';

export const getProposedToolCallLabel = ({
  template,
  toolName,
  toolLabel,
}: Pick<ProposedToolCall, 'template' | 'toolName' | 'toolLabel'>) => {
  if (template !== 'email') {
    return toolLabel;
  }

  return toolName === EMAIL_TOOL_NAMES.draft ? t`Draft email` : t`Send email`;
};
