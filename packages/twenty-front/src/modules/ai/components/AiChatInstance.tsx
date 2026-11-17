import { type ReactNode, useMemo } from 'react';

import { AiChatInstanceDisplayedThreadEffect } from '@/ai/components/AiChatInstanceDisplayedThreadEffect';
import { AiChatInstanceRegistrationEffect } from '@/ai/components/AiChatInstanceRegistrationEffect';
import { AiChatInstanceSendEffect } from '@/ai/components/AiChatInstanceSendEffect';
import { AiChatPrepromptEffect } from '@/ai/components/AiChatPrepromptEffect';
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
  const aiChatInstance = useMemo(
    () => ({ instanceId, threadId, onThreadChange }),
    [instanceId, threadId, onThreadChange],
  );

  return (
    <AiChatInstanceContext.Provider value={aiChatInstance}>
      <AiChatInstanceRegistrationEffect />
      <AiChatInstanceDisplayedThreadEffect />
      <AiChatInstanceSendEffect />
      <AiChatPrepromptEffect />
      {children}
    </AiChatInstanceContext.Provider>
  );
};
