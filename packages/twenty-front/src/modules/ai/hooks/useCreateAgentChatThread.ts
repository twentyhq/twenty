import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useRefreshAgentChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { pendingAgentChatThreadCreationState } from '@/ai/states/pendingAgentChatThreadCreationState';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { useMutation } from '@apollo/client/react';
import { CreateChatThreadDocument } from '~/generated-metadata/graphql';

export const useCreateAgentChatThread = () => {
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();
  const store = useStore();
  const { refreshAgentChatThreadPermissions } =
    useRefreshAgentChatThreadPermissions();
  const { addAgentChatThread } = useApplyAgentChatThreadUpdate();

  const [createChatThreadMutation] = useMutation(CreateChatThreadDocument, {
    onCompleted: (data, options) => {
      const newThread = {
        id: data.createChatThread.id,
        title: data.createChatThread.title ?? null,
        createdAt: data.createChatThread.createdAt,
        updatedAt: data.createChatThread.updatedAt,
        deletedAt: null,
        channelId: options?.variables?.channelId ?? null,
      };

      addAgentChatThread(newThread);
      void refreshAgentChatThreadPermissions([newThread.id]);

      if (store.get(isCreatingForFirstSendState.atom)) {
        store.set(isCreatingForFirstSendState.atom, false);
        store.set(threadIdCreatedFromDraftState.atom, newThread.id);
        return;
      }

      const newThreadId = data.createChatThread.id;
      const previousDraftKey =
        store.get(currentAiChatThreadState.atom) ??
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
      const draftsSnapshot = store.get(agentChatDraftsByThreadIdState.atom);
      const newDraft = draftsSnapshot[AGENT_CHAT_NEW_THREAD_DRAFT_KEY] ?? '';

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
    },
    onError: () => {
      store.set(isCreatingForFirstSendState.atom, false);
      store.set(hasTriggeredCreateForDraftState.atom, false);
    },
  });

  // Every caller shares the in-flight creation so a draft never gets two threads
  const createChatThread = useCallback((): Promise<string | null> => {
    const pendingCreation = store.get(pendingAgentChatThreadCreationState.atom);

    if (isDefined(pendingCreation)) {
      return pendingCreation;
    }

    const creation = createChatThreadMutation({
      variables: {
        channelId: store.get(agentChatNewThreadChannelIdState.atom),
      },
    })
      .then(
        ({ data }) => data?.createChatThread.id ?? null,
        () => null,
      )
      .finally(() => {
        store.set(pendingAgentChatThreadCreationState.atom, null);
      });

    store.set(pendingAgentChatThreadCreationState.atom, creation);

    return creation;
  }, [createChatThreadMutation, store]);

  return { createChatThread };
};
