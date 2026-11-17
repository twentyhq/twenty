import { type ReactNode } from 'react';

import { AiChatInstanceRegistrationEffect } from '@/ai/components/AiChatInstanceRegistrationEffect';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AI_CHAT_TEST_INSTANCE_ID = 'ai-chat-test-instance';

type AiChatTestInstanceProps = {
  children: ReactNode;
};

export const AiChatTestInstance = ({ children }: AiChatTestInstanceProps) => {
  const [currentAiChatThread, setCurrentAiChatThread] = useAtomState(
    currentAiChatThreadState,
  );
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return (
    <AiChatInstanceContext.Provider
      value={{
        instanceId: AI_CHAT_TEST_INSTANCE_ID,
        threadId: currentAiChatThread ?? newAiChatThreadId,
        onThreadChange: setCurrentAiChatThread,
      }}
    >
      <AiChatInstanceRegistrationEffect />
      {children}
    </AiChatInstanceContext.Provider>
  );
};
