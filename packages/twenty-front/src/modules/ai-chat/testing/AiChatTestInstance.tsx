import { type ReactNode } from 'react';

import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';
import { useListenToAiChatThreadEvents } from '@/ai-chat/instance/hooks/useListenToAiChatThreadEvents';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AI_CHAT_TEST_INSTANCE_ID = 'ai-chat-test-instance';

type AiChatTestInstanceProps = {
  children: ReactNode;
  threadId?: string;
  onThreadChange?: (threadId: string) => void;
};

const ignoreThreadChange = () => {};

export const AiChatTestInstance = ({
  children,
  threadId,
  onThreadChange = ignoreThreadChange,
}: AiChatTestInstanceProps) => {
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const instanceThreadId = threadId ?? newAiChatThreadId;

  useListenToAiChatThreadEvents({
    listenerId: AI_CHAT_TEST_INSTANCE_ID,
    threadId: instanceThreadId,
  });

  return (
    <AiChatInstanceContext.Provider
      value={{
        instanceId: AI_CHAT_TEST_INSTANCE_ID,
        threadId: instanceThreadId,
        onThreadChange,
      }}
    >
      {children}
    </AiChatInstanceContext.Provider>
  );
};
