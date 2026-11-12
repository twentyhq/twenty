import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  isDefined,
  isNonEmptyArray,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { useCanSendAgentChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useOpenNewAgentChatAsDirectMessage } from '@/ai/hooks/useOpenNewAgentChatAsDirectMessage';
import { useSendAgentChatMessage } from '@/ai/hooks/useSendAgentChatMessage';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getAgentChatInitialRecipients } from '@/ai/utils/getAgentChatInitialRecipients';
import { getAgentChatNewThreadDirectMessageWorkspaceMemberId } from '@/ai/utils/getAgentChatNewThreadDirectMessageWorkspaceMemberId';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { isAgentChatAssistantMentionedInSerializedDocument } from '@/ai/utils/isAgentChatAssistantMentionedInSerializedDocument';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  StopAgentChatStreamDocument,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';

export const useAgentChat = () => {
  const canSendAgentChatMessage = useCanSendAgentChatMessage();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isDirectMessageIdentityEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const { openNewAgentChatAsDirectMessage } =
    useOpenNewAgentChatAsDirectMessage();
  const { sendAgentChatMessage } = useSendAgentChatMessage();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const store = useStore();

  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );

  const handleSendMessage = useCallback(async () => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threadId =
      store.get(currentAiChatThreadState.atom) ?? newAiChatThreadId;
    const isNewChat = threadId === newAiChatThreadId;
    const isDirectMessage = store.get(
      agentChatThreadIsDirectMessageFamilySelector.selectorFamily(threadId),
    );
    const isSendingMessageAtom =
      agentChatIsSendingMessageFamilyState.atomFamily({ threadId });

    if (isNewChat && store.get(isSendingMessageAtom)) {
      return;
    }

    const newInboxChatRecipients =
      isNewChat && isAiChatInboxEnabled
        ? store.get(
            agentChatNewThreadRecipientsFamilyState.atomFamily(threadId),
          )
        : undefined;
    const serializedContentToSend =
      store.get(agentChatDraftsByThreadIdState.atom)[threadId] ?? '';
    const contentToSend = tipTapDocumentToMarkdown(
      serializedContentToSend,
    ).trim();

    if (contentToSend === '') {
      return;
    }

    const currentWorkspaceMemberId = store.get(
      currentWorkspaceMemberState.atom,
    )?.id;
    const participantMentions = isDirectMessage
      ? []
      : getParticipantMentionsFromSerializedDocument(
          serializedContentToSend,
        ).filter(
          ({ workspaceMemberId }) =>
            workspaceMemberId !== currentWorkspaceMemberId,
        );
    const isAssistantMentioned =
      isAgentChatAssistantMentionedInSerializedDocument(
        serializedContentToSend,
      );
    const channelId = isNewChat
      ? store.get(agentChatNewThreadChannelIdState.atom)
      : undefined;
    const initialRecipients = getAgentChatInitialRecipients({
      recipientWorkspaceMemberIds:
        newInboxChatRecipients?.recipientWorkspaceMemberIds ?? [],
      workspaceMembers: store.get(currentWorkspaceMembersState.atom),
    });
    const hasRecipients =
      newInboxChatRecipients?.isAssistantParticipant ||
      isAssistantMentioned ||
      isNonEmptyArray(initialRecipients) ||
      isNonEmptyArray(participantMentions) ||
      isDefined(channelId);

    if (isDefined(newInboxChatRecipients) && !hasRecipients) {
      enqueueToast({
        status: 'error',
        children: t`Add a recipient or a channel before sending.`,
      });

      return;
    }

    if (!canSendAgentChatMessage) {
      enqueueToast({
        status: 'error',
        children: t`No AI provider is configured on this instance.`,
      });

      return;
    }

    const directMessageWorkspaceMemberId =
      isDefined(newInboxChatRecipients) && isDirectMessageIdentityEnabled
        ? getAgentChatNewThreadDirectMessageWorkspaceMemberId({
            isAssistantParticipant:
              newInboxChatRecipients.isAssistantParticipant,
            isAssistantMentioned,
            channelId,
            recipientWorkspaceMemberIds: initialRecipients.map(
              ({ workspaceMemberId }) => workspaceMemberId,
            ),
            mentionedWorkspaceMemberIds: participantMentions.map(
              ({ workspaceMemberId }) => workspaceMemberId,
            ),
          })
        : undefined;

    if (isDefined(directMessageWorkspaceMemberId)) {
      const directMessageThreadId = await openNewAgentChatAsDirectMessage({
        newChatThreadId: threadId,
        workspaceMemberId: directMessageWorkspaceMemberId,
        serializedDraft: serializedContentToSend,
      });

      if (!isDefined(directMessageThreadId)) {
        return;
      }

      await sendAgentChatMessage({
        threadId: directMessageThreadId,
        isNewChat: false,
        isDirectMessage: true,
        newInboxChatRecipients: undefined,
        serializedContentToSend,
        contentToSend,
        participantMentions: [],
        initialRecipients: [],
        isAssistantMentioned: false,
        channelId: undefined,
      });

      return;
    }

    const agentChatSelectedFiles = store.get(agentChatSelectedFilesState.atom);

    if (!isDirectMessage && agentChatSelectedFiles.length > 0) {
      enqueueToast({
        status: 'error',
        children: t`Wait for the attachments to finish uploading.`,
      });

      return;
    }

    setCurrentAiChatThread(threadId);

    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [threadId]: '',
    }));

    dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
      content: '',
    });

    await sendAgentChatMessage({
      threadId,
      isNewChat,
      isDirectMessage,
      newInboxChatRecipients,
      serializedContentToSend,
      contentToSend,
      participantMentions,
      initialRecipients,
      isAssistantMentioned,
      channelId,
    });
  }, [
    store,
    setAgentChatDraftsByThreadId,
    canSendAgentChatMessage,
    isAiChatInboxEnabled,
    isDirectMessageIdentityEnabled,
    openNewAgentChatAsDirectMessage,
    sendAgentChatMessage,
    enqueueToast,
    setCurrentAiChatThread,
  ]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  const handleStop = useCallback(async () => {
    const threadId = store.get(currentAiChatThreadState.atom);

    if (!isDefined(threadId)) {
      return;
    }

    store.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId }),
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
