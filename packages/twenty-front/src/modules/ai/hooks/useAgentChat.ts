import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import {
  isDefined,
  isValidUuid,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { useGetBrowsingContext } from '@/ai/hooks/useGetBrowsingContext';
import { useOptimisticallyRestoreOnSend } from '@/ai/hooks/useOptimisticallyRestoreOnSend';
import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useWarnAboutParticipantMentionsNotAdded } from '@/ai/hooks/useWarnAboutParticipantMentionsNotAdded';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatLastSentBrowsingContextFamilyState } from '@/ai/states/agentChatLastSentBrowsingContextFamilyState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getAgentChatThreadAtoms } from '@/ai/utils/getAgentChatThreadAtoms';
import { getConversationTargetsFromSerializedDocument } from '@/ai/utils/getConversationTargetsFromSerializedDocument';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { toAiChatError } from '@/ai/utils/toAiChatError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import {
  SendChatMessageDocument,
  StopAgentChatStreamDocument,
} from '~/generated-metadata/graphql';

export const useAgentChat = (
  ensureThreadIdForSend: () => Promise<string | null>,
) => {
  const { modelIdForRequest } = useAgentChatModelId();
  const aiModels = useAtomStateValue(aiModelsState);
  const { getBrowsingContext } = useGetBrowsingContext();
  const { applyOptimisticRestore } = useOptimisticallyRestoreOnSend();
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();
  const { warnAboutParticipantMentionsNotAdded } =
    useWarnAboutParticipantMentionsNotAdded();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();
  const store = useStore();

  const setAgentChatUploadedFiles = useSetAtomState(
    agentChatUploadedFilesState,
  );

  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );

  const handleSendMessage = useCallback(async () => {
    const draftKey =
      store.get(currentAiChatThreadState.atom) ??
      AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
    const serializedContentToSend =
      store.get(agentChatDraftsByThreadIdState.atom)[draftKey] ?? '';
    const contentToSend = tipTapDocumentToMarkdown(
      serializedContentToSend,
    ).trim();

    if (contentToSend === '') {
      return;
    }

    if (aiModels.length === 0) {
      enqueueToast({
        variant: 'error',
        children: t`No AI provider is configured on this instance.`,
      });

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
      setCurrentAiChatThread(threadId);
      projectAiChatThreadToUrl(threadId);
    }

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
    const rollbackOptimisticRestore = applyOptimisticRestore({
      threadId,
      optimisticUpdatedAt: optimisticMessageCreatedAt,
    });

    const optimisticUserMessage: ExtendedUIMessage = {
      id: messageId,
      role: 'user',
      parts: [
        { type: 'text' as const, text: contentToSend },
        ...agentChatUploadedFiles,
      ],
      metadata: {
        createdAt: optimisticMessageCreatedAt,
        senderUserWorkspaceId: store.get(currentWorkspaceMemberState.atom)
          ?.userWorkspaceId,
      },
      status: 'sent',
    };

    const { messagesAtom, errorAtom, isAwaitingFirstChunkAtom } =
      getAgentChatThreadAtoms(threadId);
    const removeOptimisticUserMessage = () => {
      store.set(messagesAtom, (messages) =>
        messages.filter((message) => message.id !== messageId),
      );
      store.set(isAwaitingFirstChunkAtom, false);
    };

    store.set(agentChatSentMessageHandOffState.atom, (sentMessageHandOff) =>
      isDefined(sentMessageHandOff)
        ? { ...sentMessageHandOff, messageId }
        : null,
    );
    store.set(messagesAtom, (messages) => [...messages, optimisticUserMessage]);
    store.set(errorAtom, null);
    store.set(isAwaitingFirstChunkAtom, true);

    const fileAttachments = agentChatUploadedFiles.map((file) => ({
      id: file.fileId,
      filename: file.filename,
    }));

    // Members already following are sent too, so the mention brings the chat
    // back to their inbox
    const currentWorkspaceMemberId = store.get(
      currentWorkspaceMemberState.atom,
    )?.id;
    const participantMentions = getParticipantMentionsFromSerializedDocument(
      serializedContentToSend,
    ).filter(
      ({ workspaceMemberId }) => workspaceMemberId !== currentWorkspaceMemberId,
    );

    setAgentChatUploadedFiles([]);

    try {
      const { data } = await apolloClient.mutate({
        mutation: SendChatMessageDocument,
        variables: {
          threadId,
          text: contentToSend,
          messageId,
          browsingContext: browsingContextToSend,
          modelId: modelIdForRequest,
          fileAttachments:
            fileAttachments.length > 0 ? fileAttachments : undefined,
          mentionedWorkspaceMemberIds:
            participantMentions.length > 0
              ? participantMentions.map(
                  ({ workspaceMemberId }) => workspaceMemberId,
                )
              : undefined,
        },
      });

      // The stream may already have set a newer credits-exhausted error; don't clear it.
      // An included send passes with the allowance still spent, so it says nothing about credits.
      if (
        data?.sendChatMessage.isIncluded !== true &&
        !isAiChatCreditsExhaustedError(store.get(errorAtom))
      ) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsAvailable);
      }

      if (isBrowsingContextChanged) {
        store.set(lastSentBrowsingContextAtom, browsingContext);
      }

      // Filed after the send: a failed send restores the draft, so the retry files it.
      getConversationTargetsFromSerializedDocument(
        serializedContentToSend,
      ).forEach((conversationTarget) => {
        void attachChatThreadToRecord({ threadId, ...conversationTarget });
      });
      warnAboutParticipantMentionsNotAdded({
        participantMentions,
        addedWorkspaceMemberIds:
          data?.sendChatMessage.mentionedParticipantWorkspaceMemberIds ?? [],
      });

      if (data?.sendChatMessage.queued === true) {
        removeOptimisticUserMessage();
      }

      dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
    } catch (error) {
      const restoredDraftKey =
        draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY ? threadId : draftKey;

      rollbackOptimisticRestore();

      setAgentChatDraftsByThreadId((prev) => ({
        ...prev,
        [restoredDraftKey]: serializedContentToSend,
        ...(draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
          ? { [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '' }
          : {}),
      }));
      setAgentChatUploadedFiles((currentUploadedFiles) => [
        ...agentChatUploadedFiles,
        ...currentUploadedFiles,
      ]);

      removeOptimisticUserMessage();
      store.set(errorAtom, toAiChatError(error));

      if (isAiChatCreditsExhaustedError(error)) {
        store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
      }

      dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
        content: serializedContentToSend,
      });
    }
  }, [
    store,
    ensureThreadIdForSend,
    getBrowsingContext,
    setAgentChatUploadedFiles,
    setAgentChatDraftsByThreadId,
    modelIdForRequest,
    aiModels,
    enqueueToast,
    setCurrentAiChatThread,
    projectAiChatThreadToUrl,
    apolloClient,
    applyOptimisticRestore,
    attachChatThreadToRecord,
    warnAboutParticipantMentionsNotAdded,
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

    store.set(
      getAgentChatThreadAtoms(threadId).isAwaitingFirstChunkAtom,
      false,
    );

    try {
      await apolloClient.mutate({
        mutation: StopAgentChatStreamDocument,
        variables: { threadId },
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  }, [store, apolloClient, enqueueToast]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_STOP_EVENT_NAME,
    onBrowserEvent: handleStop,
  });

  return {
    handleSendMessage,
    handleStop,
  };
};
