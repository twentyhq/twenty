import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { SEND_CHAT_MESSAGE } from '@/ai/graphql/mutations/sendChatMessage';
import { STOP_AGENT_CHAT_STREAM } from '@/ai/graphql/mutations/stopAgentChatStream';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useAgentChat = (
  ensureThreadIdForSend: () => Promise<string | null>,
) => {
  const { modelIdForRequest } = useAgentChatModelId();
  const { getBrowsingContext } = useGetBrowsingContext();
  const apolloClient = useApolloClient();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const store = useStore();

  const agentChatSelectedFiles = useAtomStateValue(agentChatSelectedFilesState);

  const [, setPendingThreadIdAfterFirstSend] = useState<string | null>(null);

  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useAtomState(
    agentChatUploadedFilesState,
  );

  const [, setAgentChatInput] = useAtomState(agentChatInputState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );

  const handleSendMessage = useCallback(async () => {
    const draftKey =
      store.get(currentAiChatThreadState.atom) ??
      AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
    const contentToSend =
      draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
        ? (
            store.get(agentChatDraftsByThreadIdState.atom)[
              AGENT_CHAT_NEW_THREAD_DRAFT_KEY
            ] ?? store.get(agentChatInputState.atom)
          ).trim()
        : store.get(agentChatInputState.atom).trim();

    if (contentToSend === '') {
      return;
    }

    const isLoading = agentChatSelectedFiles.length > 0;

    if (isLoading) {
      return;
    }

    const threadId = await ensureThreadIdForSend();

    if (!isDefined(threadId)) {
      return;
    }

    if (draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      setPendingThreadIdAfterFirstSend(threadId);
    }

    setAgentChatInput('');
    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [draftKey]: '',
    }));

    const browsingContext = getBrowsingContext();
    const messageId = v4();

    const optimisticUserMessage: ExtendedUIMessage = {
      id: messageId,
      role: 'user',
      parts: [
        { type: 'text' as const, text: contentToSend },
        ...agentChatUploadedFiles,
      ],
      metadata: {
        createdAt: new Date().toISOString(),
      },
      status: 'sent',
    };

    const messagesAtom = agentChatMessagesComponentFamilyState.atomFamily({
      instanceId: AGENT_CHAT_INSTANCE_ID,
      familyKey: { threadId },
    });
    const errorAtom = agentChatErrorComponentFamilyState.atomFamily({
      instanceId: AGENT_CHAT_INSTANCE_ID,
      familyKey: { threadId },
    });

    const currentMessages = store.get(messagesAtom);

    store.set(messagesAtom, [...currentMessages, optimisticUserMessage]);
    store.set(errorAtom, null);

    const fileIds = agentChatUploadedFiles.map((file) => file.fileId);

    setAgentChatUploadedFiles([]);

    try {
      const { data } = await apolloClient.mutate<{
        sendChatMessage: {
          messageId: string;
          queued: boolean;
          streamId?: string;
        };
      }>({
        mutation: SEND_CHAT_MESSAGE,
        variables: {
          threadId,
          text: contentToSend,
          messageId,
          browsingContext: browsingContext ?? null,
          modelId: modelIdForRequest ?? undefined,
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        },
      });

      if (data?.sendChatMessage?.queued) {
        const latestMessages = store.get(messagesAtom);

        store.set(
          messagesAtom,
          latestMessages.filter((message) => message.id !== messageId),
        );
      }

      dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);

      setPendingThreadIdAfterFirstSend((pendingId) => {
        if (isDefined(pendingId)) {
          setCurrentAiChatThread(pendingId);
        }

        return null;
      });
    } catch (error) {
      const restoredDraftKey =
        draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY ? threadId : draftKey;

      setAgentChatInput(contentToSend);
      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [restoredDraftKey]: contentToSend,
        ...(draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
          ? { [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '' }
          : {}),
      }));

      const latestMessages = store.get(messagesAtom);

      store.set(
        messagesAtom,
        latestMessages.filter((message) => message.id !== messageId),
      );

      store.set(
        errorAtom,
        CombinedGraphQLErrors.is(error) || error instanceof Error
          ? error
          : new Error('An unexpected error occurred'),
      );

      dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
        content: contentToSend,
      });

      if (draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
        setCurrentAiChatThread(threadId);
      }

      setPendingThreadIdAfterFirstSend(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store,
    agentChatSelectedFiles,
    ensureThreadIdForSend,
    setAgentChatInput,
    getBrowsingContext,
    agentChatUploadedFiles,
    setAgentChatUploadedFiles,
    setAgentChatDraftsByThreadId,
    modelIdForRequest,
    setCurrentAiChatThread,
    apolloClient,
  ]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  const handleStop = useCallback(async () => {
    const threadId = store.get(currentAiChatThreadState.atom);

    if (!isDefined(threadId) || !isValidUuid(threadId)) {
      return;
    }

    apolloClient
      .mutate({
        mutation: STOP_AGENT_CHAT_STREAM,
        variables: { threadId },
      })
      .catch(() => {});
  }, [store, apolloClient]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_STOP_EVENT_NAME,
    onBrowserEvent: handleStop,
  });

  return {
    handleSendMessage,
    handleStop,
  };
};
