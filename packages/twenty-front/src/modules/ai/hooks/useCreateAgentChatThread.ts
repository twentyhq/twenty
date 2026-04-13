import { useStore } from 'jotai';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useMutation } from '@apollo/client/react';
import { CreateChatThreadDocument } from '~/generated-metadata/graphql';

export const useCreateAgentChatThread = () => {
  const setCurrentAIChatThread = useSetAtomState(currentAIChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setIsCreatingChatThread = useSetAtomState(isCreatingChatThreadState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const store = useStore();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const [createChatThread] = useMutation(CreateChatThreadDocument, {
    onCompleted: (data) => {
      const newThread: FlatAgentChatThread = {
        id: data.createChatThread.id,
        title: data.createChatThread.title ?? null,
        createdAt: data.createChatThread.createdAt,
        updatedAt: data.createChatThread.updatedAt,
        conversationSize: 0,
        contextWindowTokens: null,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalInputCredits: 0,
        totalOutputCredits: 0,
      };

      addToDraft({ key: 'agentChatThreads', items: [newThread] });
      applyChanges();

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
    },
    onError: () => {
      setIsCreatingChatThread(false);
      store.set(isCreatingForFirstSendState.atom, false);
      store.set(hasTriggeredCreateForDraftState.atom, false);
    },
  });

  return { createChatThread };
};
