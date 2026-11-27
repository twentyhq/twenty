import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadStreamDependencies } from '@/ai-chat/instance/types/AiChatThreadStreamDependencies';
import { aiChatThreadIsMissingFamilyState } from '@/ai-chat/states/server/aiChatThreadIsMissingFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';

export const loadAiChatThreadIfUnknown = async ({
  store,
  threadId,
  loadAiChatThread,
  isDisposed,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  loadAiChatThread: AiChatThreadStreamDependencies['loadAiChatThread'];
  isDisposed: () => boolean;
}) => {
  const storedThread = store.get(
    aiChatThreadRecordFamilySelector.selectorFamily(threadId),
  );

  if (isDefined(storedThread?.conversationType)) {
    return;
  }

  const loadedThread = await loadAiChatThread(threadId);

  if (!isDisposed() && loadedThread === null) {
    store.set(aiChatThreadIsMissingFamilyState.atomFamily({ threadId }), true);
  }
};
