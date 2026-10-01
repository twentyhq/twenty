import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';

type ChatWidgetThreadSyncEffectProps = {
  threadId: string;
};

// Once per record, so a later switch (e.g. a new chat) is left alone
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
