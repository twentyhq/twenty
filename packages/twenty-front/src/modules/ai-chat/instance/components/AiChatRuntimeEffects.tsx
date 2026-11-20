import { AiChatThreadRuntimeEffect } from '@/ai-chat/instance/components/AiChatThreadRuntimeEffect';
import { useIsAiChatRuntimeEnabled } from '@/ai-chat/hooks/useIsAiChatRuntimeEnabled';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai-chat/states/aiChatOpenThreadIdByInstanceIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatRuntimeEffects = () => {
  const isAiChatRuntimeEnabled = useIsAiChatRuntimeEnabled();
  const aiChatOpenThreadIdByInstanceId = useAtomStateValue(
    aiChatOpenThreadIdByInstanceIdState,
  );

  if (!isAiChatRuntimeEnabled) {
    return null;
  }

  const openThreadIds = [
    ...new Set(Object.values(aiChatOpenThreadIdByInstanceId)),
  ];

  return openThreadIds.map((threadId) => (
    <AiChatThreadRuntimeEffect key={threadId} threadId={threadId} />
  ));
};
