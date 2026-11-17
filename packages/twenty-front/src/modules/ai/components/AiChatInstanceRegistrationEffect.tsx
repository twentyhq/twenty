import { useEffect } from 'react';

import { useAiChatInstanceOrThrow } from '@/ai/hooks/useAiChatInstanceOrThrow';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai/states/aiChatOpenThreadIdByInstanceIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AiChatInstanceRegistrationEffect = () => {
  const { instanceId, threadId } = useAiChatInstanceOrThrow();
  const setAiChatOpenThreadIdByInstanceId = useSetAtomState(
    aiChatOpenThreadIdByInstanceIdState,
  );

  useEffect(() => {
    setAiChatOpenThreadIdByInstanceId((openThreadIdByInstanceId) => ({
      ...openThreadIdByInstanceId,
      [instanceId]: threadId,
    }));

    return () => {
      setAiChatOpenThreadIdByInstanceId(
        ({ [instanceId]: _closedThreadId, ...openThreadIdByInstanceId }) =>
          openThreadIdByInstanceId,
      );
    };
  }, [instanceId, threadId, setAiChatOpenThreadIdByInstanceId]);

  return null;
};
