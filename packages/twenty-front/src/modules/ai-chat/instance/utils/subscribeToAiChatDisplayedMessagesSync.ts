import { type createStore } from 'jotai';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';

export const subscribeToAiChatDisplayedMessagesSync = ({
  store,
  threadId,
  isInactive,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  isInactive: () => boolean;
}) => {
  const familyKey = { threadId };
  const replyStatusAtom =
    aiChatThreadReplyStatusFamilyState.atomFamily(familyKey);
  const isFetchingAtom =
    aiChatThreadIsFetchingMessagesFamilyState.atomFamily(familyKey);
  const fetchedMessagesAtom =
    aiChatThreadFetchedMessagesFamilyState.atomFamily(familyKey);
  const displayedMessagesAtom =
    aiChatThreadDisplayedMessagesFamilyState.atomFamily(familyKey);

  let isSyncScheduled = false;

  const syncDisplayedMessages = () => {
    if (isSyncScheduled) {
      return;
    }

    isSyncScheduled = true;

    queueMicrotask(() => {
      isSyncScheduled = false;

      if (
        store.get(replyStatusAtom) !== 'idle' ||
        store.get(isFetchingAtom) ||
        isInactive()
      ) {
        return;
      }

      const fetchedMessages = store.get(fetchedMessagesAtom).messages;

      if (store.get(displayedMessagesAtom) !== fetchedMessages) {
        store.set(displayedMessagesAtom, fetchedMessages);
      }
    });
  };

  const unsubscribes = [
    store.sub(replyStatusAtom, syncDisplayedMessages),
    store.sub(isFetchingAtom, syncDisplayedMessages),
    store.sub(fetchedMessagesAtom, syncDisplayedMessages),
  ];

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};
