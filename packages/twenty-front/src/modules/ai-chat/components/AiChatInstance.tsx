import { type ReactNode, useMemo } from 'react';

import { AiChatInstanceRegistrationEffect } from '@/ai-chat/components/AiChatInstanceRegistrationEffect';
import { AiChatPrepromptEffect } from '@/ai-chat/composer/components/AiChatPrepromptEffect';
import { AiChatSendMessageEffect } from '@/ai-chat/components/AiChatSendMessageEffect';
import { useIsAiChatRuntimeEnabled } from '@/ai-chat/hooks/useIsAiChatRuntimeEnabled';
import { AiChatInstanceContext } from '@/ai-chat/contexts/AiChatInstanceContext';

type AiChatInstanceProps = {
  instanceId: string;
  threadId: string;
  onThreadChange: (threadId: string) => void;
  children: ReactNode;
};

export const AiChatInstance = ({
  instanceId,
  threadId,
  onThreadChange,
  children,
}: AiChatInstanceProps) => {
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const aiChatInstance = useMemo(
    () => ({ instanceId, threadId, onThreadChange }),
    [instanceId, threadId, onThreadChange],
  );

  return (
    <AiChatInstanceContext.Provider value={aiChatInstance}>
      <AiChatInstanceRegistrationEffect />
      {isAiChatRuntimeEnabled && (
        <>
          <AiChatPrepromptEffect />
          <AiChatSendMessageEffect />
        </>
      )}
      {children}
    </AiChatInstanceContext.Provider>
  );
};
