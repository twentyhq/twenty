import { isValidUuid } from 'twenty-shared/utils';

import { useOpenAiChatThreadView } from '@/ai-chat/hooks/useOpenAiChatThreadView';

type AiChatPageThreadOpenViewEffectProps = {
  threadId: string;
};

export const AiChatPageThreadOpenViewEffect = ({
  threadId,
}: AiChatPageThreadOpenViewEffectProps) => {
  useOpenAiChatThreadView(isValidUuid(threadId) ? threadId : null);

  return null;
};
