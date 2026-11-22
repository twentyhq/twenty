import { useEffect } from 'react';

import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useListenToAiChatThreadEvents = ({
  listenerId,
  threadId,
}: {
  listenerId: string;
  threadId: string;
}) => {
  const setAiChatRequiredThreadListeners = useSetAtomState(
    aiChatRequiredThreadListenersState,
  );

  useEffect(() => {
    setAiChatRequiredThreadListeners((requiredThreadListeners) => ({
      ...requiredThreadListeners,
      [listenerId]: threadId,
    }));

    return () => {
      setAiChatRequiredThreadListeners(
        ({ [listenerId]: _removedThreadId, ...requiredThreadListeners }) =>
          requiredThreadListeners,
      );
    };
  }, [listenerId, threadId, setAiChatRequiredThreadListeners]);
};
