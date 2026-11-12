import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { useOpenDirectMessageThreadOrThrow } from '@/ai/hooks/useOpenDirectMessageThreadOrThrow';
import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';

export const useOpenNewAgentChatAsDirectMessage = () => {
  const store = useStore();
  const { enqueueToast } = useToast();
  const { openDirectMessageThreadOrThrow } =
    useOpenDirectMessageThreadOrThrow();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl({
    shouldPreserveClosedInbox: true,
  });

  const openNewAgentChatAsDirectMessage = useCallback(
    async ({
      newChatThreadId,
      workspaceMemberId,
      serializedDraft,
    }: {
      newChatThreadId: string;
      workspaceMemberId: string;
      serializedDraft: string;
    }) => {
      if (
        isNonEmptyArray(store.get(agentChatSelectedFilesState.atom)) ||
        isNonEmptyArray(store.get(agentChatUploadedFilesState.atom))
      ) {
        enqueueToast({
          status: 'error',
          children: t`Direct messages don't support attachments.`,
        });

        return;
      }

      const isSendingMessageAtom =
        agentChatIsSendingMessageFamilyState.atomFamily({
          threadId: newChatThreadId,
        });

      store.set(isSendingMessageAtom, true);
      store.set(currentAiChatThreadState.atom, newChatThreadId);
      store.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
        ...drafts,
        [newChatThreadId]: '',
      }));
      dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
        content: '',
      });

      try {
        const directMessageThread =
          await openDirectMessageThreadOrThrow(workspaceMemberId);

        store.set(
          agentChatNewThreadRecipientsFamilyState.atomFamily(newChatThreadId),
          AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
        );

        if (store.get(currentAiChatThreadState.atom) === newChatThreadId) {
          store.set(currentAiChatThreadState.atom, directMessageThread.id);
          projectAiChatThreadToUrl(directMessageThread.id);
        }

        return directMessageThread.id;
      } catch (error) {
        store.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
          ...drafts,
          [newChatThreadId]: serializedDraft,
        }));

        if (store.get(currentAiChatThreadState.atom) === newChatThreadId) {
          dispatchBrowserEvent(AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
            content: serializedDraft,
          });
        }

        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [
      enqueueToast,
      openDirectMessageThreadOrThrow,
      projectAiChatThreadToUrl,
      store,
    ],
  );

  return { openNewAgentChatAsDirectMessage };
};
