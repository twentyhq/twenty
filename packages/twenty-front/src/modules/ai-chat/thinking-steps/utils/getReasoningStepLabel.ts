import { t } from '@lingui/core/macro';

import { getLatestReasoningTitle } from '@/ai-chat/thinking-steps/utils/getLatestReasoningTitle';

export const getReasoningStepLabel = ({
  text,
  isActive,
}: {
  text: string;
  isActive: boolean;
}) => getLatestReasoningTitle(text) ?? (isActive ? t`Thinking` : t`Thought`);
