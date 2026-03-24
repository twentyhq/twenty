import { useStore } from 'jotai';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useMutation } from '@apollo/client/react';
import {
  CreateChatThreadDocument,
  GetChatThreadsDocument,
} from '~/generated-metadata/graphql';
import { getOperationName } from '~/utils/getOperationName';

export const useCreateAgentChatThread = () => {
  const setCurrentAIChatThread = useSetAtomState(currentAIChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setIsCreatingChatThread = useSetAtomState(isCreatingChatThreadState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();

  const [createChatThread] = useMutation(CreateChatThreadDocument, {
    onCompleted: (data) => {
      if (store.get(isCreatingForFirstSendState.atom)) {
        store.set(isCreatingForFirstSendState.atom, false);
        setIsCreatingChatThread(false);
        return;
      }

      const newThreadId = data.createChatThread.id;
      const previousDraftKey =
        store.get(currentAIChatThreadState.atom) ??
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
      const draftsSnapshot = store.get(agentChatDraftsByThreadIdState.atom);
      const newDraft = draftsSnapshot[AGENT_CHAT_NEW_THREAD_DRAFT_KEY] ?? '';

      setIsCreatingChatThread(false);

      if (previousDraftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
        store.set(hasTriggeredCreateForDraftState.atom, true);
        setAgentChatDraftsByThreadId((previousDrafts) => ({
          ...previousDrafts,
          [newThreadId]: newDraft,
          [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '',
        }));
        store.set(shouldFocusChatEditorState.atom, true);
        store.set(skipMessagesSkeletonUntilLoadedState.atom, true);
        store.set(threadIdCreatedFromDraftState.atom, newThreadId);
      } else {
        setAgentChatDraftsByThreadId((previousDrafts) => ({
          ...previousDrafts,
          [previousDraftKey]: store.get(agentChatInputState.atom),
        }));
      }

      setCurrentAIChatThread(newThreadId);
      setAgentChatInput(newDraft);
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);
    },
    onError: () => {
      setIsCreatingChatThread(false);
      store.set(isCreatingForFirstSendState.atom, false);
      store.set(hasTriggeredCreateForDraftState.atom, false);
    },
    refetchQueries: [
      getOperationName(GetChatThreadsDocument) ?? 'GetChatThreads',
    ],
  });

  return { createChatThread };
};
