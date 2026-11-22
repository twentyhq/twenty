import { type createStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isNonEmptyString } from 'twenty-shared/utils';

import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadUpdate } from '@/ai-chat/threads/types/AiChatThreadUpdate';
import { getAiChatMessageThreadTitle } from '@/ai-chat/threads/utils/getAiChatMessageThreadTitle';
import { aiChatThreadUsageFamilyState } from '@/ai-chat/usage/states/aiChatThreadUsageFamilyState';
import { accumulateAiChatUsage } from '@/ai-chat/usage/utils/accumulateAiChatUsage';
import { getAiChatUsageFromThread } from '@/ai-chat/usage/utils/getAiChatUsageFromThread';

export const createAiChatStreamedMessageThreadUpdater = ({
  store,
  threadId,
  applyAiChatThreadUpdate,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  applyAiChatThreadUpdate: (update: AiChatThreadUpdate) => void;
}) => {
  let lastUsageCountedMessageId: string | null = null;

  return (message: ExtendedUIMessage) => {
    const title = getAiChatMessageThreadTitle(message);
    const threadRecord = store.get(
      aiChatThreadRecordFamilySelector.selectorFamily(threadId),
    );

    if (
      isDefined(title) &&
      isDefined(threadRecord) &&
      !isNonEmptyString(threadRecord.title)
    ) {
      applyAiChatThreadUpdate({ id: threadId, title });
    }

    const usage = message.metadata?.usage;
    const model = message.metadata?.model;

    if (
      !isDefined(usage) ||
      !isDefined(model) ||
      lastUsageCountedMessageId === message.id
    ) {
      return;
    }

    lastUsageCountedMessageId = message.id;

    store.set(
      aiChatThreadUsageFamilyState.atomFamily({ threadId }),
      (previousUsage) =>
        accumulateAiChatUsage(
          previousUsage ??
            (isDefined(threadRecord)
              ? getAiChatUsageFromThread(threadRecord)
              : null),
          usage,
          model,
        ),
    );
  };
};
