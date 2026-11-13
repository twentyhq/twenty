import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { INBOX_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { useLoadInboxThread } from '@/ai/hooks/useLoadAgentChatThread';
import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { inboxDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { inboxIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { inboxNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { inboxSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { inboxUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';

export const useOpenNewInboxAsDirectMessage = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { loadInboxThread } = useLoadInboxThread();
  const { projectInboxThreadToUrl } = useProjectInboxThreadToUrl({
    shouldPreserveClosedInbox: true,
  });

  const openNewInboxAsDirectMessage = useCallback(
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
        isNonEmptyArray(store.get(inboxSelectedFilesState.atom)) ||
        isNonEmptyArray(store.get(inboxUploadedFilesState.atom))
      ) {
        enqueueToast({
          status: 'error',
          children: t`Direct messages don't support attachments.`,
        });

        return;
      }

      const isSendingMessageAtom = inboxIsSendingMessageFamilyState.atomFamily({
        threadId: newChatThreadId,
      });

      store.set(isSendingMessageAtom, true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: OpenDirectMessageDocument,
          variables: { workspaceMemberId },
        });
        const directMessageThreadId = data?.openDirectMessage;
        assertIsDefinedOrThrow(directMessageThreadId);
        const directMessageThread = await loadInboxThread(
          directMessageThreadId,
        );
        assertIsDefinedOrThrow(directMessageThread);

        if (
          store.get(inboxDraftsByThreadIdState.atom)[newChatThreadId] ===
          serializedDraft
        ) {
          store.set(inboxDraftsByThreadIdState.atom, (drafts) => ({
            ...drafts,
            [newChatThreadId]: '',
          }));
          store.set(
            inboxNewThreadRecipientsFamilyState.atomFamily(newChatThreadId),
            INBOX_NEW_THREAD_DEFAULT_RECIPIENTS,
          );
        }

        if (
          (store.get(currentInboxThreadState.atom) ??
            store.get(newInboxThreadIdState.atom)) === newChatThreadId
        ) {
          store.set(currentInboxThreadState.atom, directMessageThreadId);
          projectInboxThreadToUrl(directMessageThreadId);
        }

        return directMessageThreadId;
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [
      apolloClient,
      enqueueToast,
      loadInboxThread,
      projectInboxThreadToUrl,
      store,
    ],
  );

  return { openNewInboxAsDirectMessage };
};
