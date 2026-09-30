import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useStore } from 'jotai';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';

import { useMutation } from '@apollo/client/react';
import { CreateChatThreadDocument } from '~/generated-metadata/graphql';

export const useCreateAgentChatThread = () => {
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setIsCreatingChatThread = useSetAtomState(isCreatingChatThreadState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();
  const store = useStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThread } = useApplyAgentChatThreadUpdate();

  const [createChatThread] = useMutation(CreateChatThreadDocument, {
    onCompleted: (data) => {
      const newThread = {
        id: data.createChatThread.id,
        title: data.createChatThread.title ?? null,
        createdAt: data.createChatThread.createdAt,
        updatedAt: data.createChatThread.updatedAt,
        deletedAt: null,
      };

      addAgentChatThread(newThread);
      void refreshAgentChatThreadPermissions([newThread.id]);

      if (store.get(isCreatingForFirstSendState.atom)) {
        store.set(isCreatingForFirstSendState.atom, false);
        store.set(threadIdCreatedFromDraftState.atom, newThread.id);
        setIsCreatingChatThread(false);
        return;
      }

      const newThreadId = data.createChatThread.id;
      const previousDraftKey =
        store.get(currentAiChatThreadState.atom) ??
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
      }

      setCurrentAiChatThread(newThreadId);
      projectAiChatThreadToUrl(newThreadId);
      setAgentChatInput(tipTapDocumentToMarkdown(newDraft));
    },
    onError: () => {
      setIsCreatingChatThread(false);
      store.set(isCreatingForFirstSendState.atom, false);
      store.set(hasTriggeredCreateForDraftState.atom, false);
    },
  });

  return { createChatThread };
};
