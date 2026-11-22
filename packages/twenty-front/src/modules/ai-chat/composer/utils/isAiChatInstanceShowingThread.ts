import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';

export const isAiChatInstanceShowingThread = ({
  store,
  instanceId,
  threadId,
}: {
  store: ReturnType<typeof createStore>;
  instanceId: string | undefined;
  threadId: string;
}) =>
  !isDefined(instanceId) ||
  store.get(aiChatRequiredThreadListenersState.atom)[instanceId] === threadId;
