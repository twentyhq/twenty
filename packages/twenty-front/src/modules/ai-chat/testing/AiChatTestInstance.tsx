import { type ReactNode } from 'react';

import { AiChatInstanceRegistrationEffect } from '@/ai-chat/components/AiChatInstanceRegistrationEffect';
import { AiChatInstanceContext } from '@/ai-chat/states/contexts/AiChatInstanceContext';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatTestInstanceThreadIdState } from '@/ai-chat/testing/aiChatTestInstanceThreadIdState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AI_CHAT_TEST_INSTANCE_ID = 'ai-chat-test-instance';

type AiChatTestInstanceProps = {
  children: ReactNode;
};

export const AiChatTestInstance = ({ children }: AiChatTestInstanceProps) => {
  const [aiChatTestInstanceThreadId, setAiChatTestInstanceThreadId] =
    useAtomState(aiChatTestInstanceThreadIdState);
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  return (
    <AiChatInstanceContext.Provider
      value={{
        instanceId: AI_CHAT_TEST_INSTANCE_ID,
        threadId: aiChatTestInstanceThreadId ?? newAiChatThreadId,
        onThreadChange: setAiChatTestInstanceThreadId,
      }}
    >
      <AiChatInstanceRegistrationEffect />
      {children}
    </AiChatInstanceContext.Provider>
  );
};
