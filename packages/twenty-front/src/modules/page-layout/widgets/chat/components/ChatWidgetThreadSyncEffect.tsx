import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';

type ChatWidgetThreadSyncEffectProps = {
  threadId: string;
};

// The chat runs on the current thread, so the widget points it at its record
// once per record; a later switch, such as starting a new chat, is left alone
export const ChatWidgetThreadSyncEffect = ({
  threadId,
}: ChatWidgetThreadSyncEffectProps) => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const [syncedThreadId, setSyncedThreadId] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (syncedThreadId === threadId) {
      return;
    }

    setSyncedThreadId(threadId);

    if (store.get(currentAiChatThreadState.atom) !== threadId) {
      switchThreadWithDraft(threadId);
    }
  }, [store, switchThreadWithDraft, syncedThreadId, threadId]);

  return null;
};
