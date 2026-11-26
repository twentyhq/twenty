import { type createStore } from 'jotai';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';

export const applyAiChatMessageReactionsUpdate = ({
  store,
  threadId,
  event,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  event: Extract<
    AgentChatSubscriptionEvent,
    { type: 'message-reactions-updated' }
  >;
}) => {
  const liveReactionRevisionsAtom =
    aiChatMessageReactionRevisionsFamilyState.atomFamily({ threadId });
  const liveReactionRevisions = store.get(liveReactionRevisionsAtom);
  const appliedRevision = liveReactionRevisions[event.messageId];

  if (isDefined(appliedRevision) && event.revision < appliedRevision) {
    return;
  }

  store.set(liveReactionRevisionsAtom, {
    ...liveReactionRevisions,
    [event.messageId]: event.revision,
  });
  store.set(
    aiChatMessageReactionsFamilyState.atomFamily({
      messageId: event.messageId,
    }),
    event.reactions,
  );
};
