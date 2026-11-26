import { t } from '@lingui/core/macro';
import { type ProposedToolCall } from 'twenty-shared/ai';

const DRAFT_EMAIL_TOOL_NAME = 'draft_email';

export const getProposedToolCallLabel = ({
  template,
  toolName,
  toolLabel,
}: Pick<ProposedToolCall, 'template' | 'toolName' | 'toolLabel'>) => {
  if (template !== 'email') {
    return toolLabel;
  }

  return toolName === DRAFT_EMAIL_TOOL_NAME ? t`Draft email` : t`Send email`;
};
