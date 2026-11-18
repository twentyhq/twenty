import { useEffect } from 'react';

import { aiChatContinueInSidePanelThreadIdState } from '@/ai-chat/states/aiChatContinueInSidePanelThreadIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type AiChatPageContinueInSidePanelEffectProps = {
  threadId: string;
};

export const AiChatPageContinueInSidePanelEffect = ({
  threadId,
}: AiChatPageContinueInSidePanelEffectProps) => {
  const setAiChatContinueInSidePanelThreadId = useSetAtomState(
    aiChatContinueInSidePanelThreadIdState,
  );

  useEffect(() => {
    setAiChatContinueInSidePanelThreadId(threadId);

    return () => {
      setAiChatContinueInSidePanelThreadId(null);
    };
  }, [threadId, setAiChatContinueInSidePanelThreadId]);

  return null;
};
