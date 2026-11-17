import { type ReactNode, useId } from 'react';

import { AiChatInstance } from '@/ai/components/AiChatInstance';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatCurrentThreadInstanceProps = {
  children: ReactNode;
};

export const AiChatCurrentThreadInstance = ({
  children,
}: AiChatCurrentThreadInstanceProps) => {
  const instanceId = useId();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);
  const { selectAiChatThread } = useSelectAiChatThread();

  return (
    <AiChatInstance
      instanceId={instanceId}
      threadId={currentAiChatThread ?? newAiChatThreadId}
      onThreadChange={selectAiChatThread}
    >
      {children}
    </AiChatInstance>
  );
};
