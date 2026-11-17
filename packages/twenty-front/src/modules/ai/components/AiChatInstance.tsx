import { type ReactNode, useContext, useMemo } from 'react';

import { AiChatInstanceRegistrationEffect } from '@/ai/components/AiChatInstanceRegistrationEffect';
import { AiChatPrepromptEffect } from '@/ai/components/AiChatPrepromptEffect';
import { AiChatSendMessageEffect } from '@/ai/components/AiChatSendMessageEffect';
import { AiChatRuntimeContext } from '@/ai/contexts/AiChatRuntimeContext';
import { useIsAiChatRuntimeEnabled } from '@/ai/hooks/useIsAiChatRuntimeEnabled';
import { AiChatInstanceContext } from '@/ai/states/contexts/AiChatInstanceContext';

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
  const isAiChatRuntimeMounted = useContext(AiChatRuntimeContext);
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const aiChatInstance = useMemo(
    () => ({ instanceId, threadId, onThreadChange }),
    [instanceId, threadId, onThreadChange],
  );

  return (
    <AiChatInstanceContext.Provider value={aiChatInstance}>
      <AiChatInstanceRegistrationEffect />
      {isAiChatRuntimeEnabled && <AiChatPrepromptEffect />}
      {isAiChatRuntimeMounted && isAiChatRuntimeEnabled && (
        <AiChatSendMessageEffect />
      )}
      {children}
    </AiChatInstanceContext.Provider>
  );
};
