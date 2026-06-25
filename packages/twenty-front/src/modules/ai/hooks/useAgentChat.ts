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
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { useOptimisticallyUnarchiveOnSend } from '@/ai/hooks/useOptimisticallyUnarchiveOnSend';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatLastSentBrowsingContextFamilyState } from '@/ai/states/agentChatLastSentBrowsingContextFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useAgentChat = (
  ensureThreadIdForSend: () => Promise<string | null>,
) => {
  const { modelIdForRequest } = useAgentChatModelId();
  const { getBrowsingContext } = useGetBrowsingContext();
  const { applyOptimisticUnarchive } = useOptimisticallyUnarchiveOnSend();
  const apolloClient = useApolloClient();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const store = useStore();

  const [, setPendingThreadIdAfterFirstSend] = useState<string | null>(null);

  const setAgentChatUploadedFiles = useSetAtomState(
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

    const agentChatSelectedFiles = store.get(agentChatSelectedFilesState.atom);

    if (agentChatSelectedFiles.length > 0) {
      return;
    }

    const agentChatUploadedFiles = store.get(agentChatUploadedFilesState.atom);

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
    const lastSentBrowsingContextAtom =
      agentChatLastSentBrowsingContextFamilyState.atomFamily(threadId);
    const lastSentBrowsingContext = store.get(lastSentBrowsingContextAtom);
    const isBrowsingContextChanged =
      lastSentBrowsingContext === undefined
        ? browsingContext !== null
        : JSON.stringify(browsingContext) !==
          JSON.stringify(lastSentBrowsingContext);
    const browsingContextToSend = isBrowsingContextChanged
      ? browsingContext
      : null;
    const messageId = v4();
    const optimisticMessageCreatedAt = new Date().toISOString();
    const rollbackOptimisticUnarchive = applyOptimisticUnarchive(
      threadId,
      optimisticMessageCreatedAt,
    );

    const optimisticUserMessage: ExtendedUIMessage = {
      id: messageId,
      role: 'user',
      parts: [
        { type: 'text' as const, text: contentToSend },
        ...agentChatUploadedFiles,
      ],
      metadata: {
        createdAt: optimisticMessageCreatedAt,
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

    const fileAttachments = agentChatUploadedFiles.map((file) => ({
      id: file.fileId,
      filename: file.filename,
    }));
    const uploadedFilesSnapshot = agentChatUploadedFiles;

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
          browsingContext: browsingContextToSend,
          modelId: modelIdForRequest ?? undefined,
          fileAttachments:
            fileAttachments.length > 0 ? fileAttachments : undefined,
        },
      });

      if (isBrowsingContextChanged) {
        store.set(lastSentBrowsingContextAtom, browsingContext);
      }

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

      rollbackOptimisticUnarchive?.();

      setAgentChatInput(contentToSend);
      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [restoredDraftKey]: contentToSend,
        ...(draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
          ? { [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '' }
          : {}),
      }));
      setAgentChatUploadedFiles(uploadedFilesSnapshot);

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
    ensureThreadIdForSend,
    setAgentChatInput,
    getBrowsingContext,
    setAgentChatUploadedFiles,
    setAgentChatDraftsByThreadId,
    modelIdForRequest,
    setCurrentAiChatThread,
    apolloClient,
    applyOptimisticUnarchive,
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

    try {
      await apolloClient.mutate({
        mutation: STOP_AGENT_CHAT_STREAM,
        variables: { threadId },
      });
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  }, [store, apolloClient, enqueueErrorSnackBar]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_STOP_EVENT_NAME,
    onBrowserEvent: handleStop,
  });

  return {
    handleSendMessage,
    handleStop,
  };
};
