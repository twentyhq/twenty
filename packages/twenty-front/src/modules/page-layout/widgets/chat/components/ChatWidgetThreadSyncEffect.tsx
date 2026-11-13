import { useStore } from 'jotai';
import { useLayoutEffect, useState } from 'react';

import { useSwitchInboxThreadWithDraft } from '@/ai/hooks/useSwitchInboxThreadWithDraft';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';

type ChatWidgetThreadSyncEffectProps = {
  threadId: string;
};

// Points the chat at the record's thread once per record, so a later switch (e.g. a new chat) is left alone
export const ChatWidgetThreadSyncEffect = ({
  threadId,
}: ChatWidgetThreadSyncEffectProps) => {
  const store = useStore();
  const { switchThreadWithDraft } = useSwitchInboxThreadWithDraft();
  const [syncedThreadId, setSyncedThreadId] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (syncedThreadId === threadId) {
      return;
    }

    setSyncedThreadId(threadId);

    if (store.get(currentInboxThreadState.atom) !== threadId) {
      switchThreadWithDraft(threadId);
    }
  }, [store, switchThreadWithDraft, syncedThreadId, threadId]);

  return null;
};
