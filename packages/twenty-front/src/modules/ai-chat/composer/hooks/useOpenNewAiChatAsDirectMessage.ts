import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/composer/constants/AiChatNewThreadDefaultRecipients';
import { useLoadAiChatThread } from '@/ai-chat/threads/hooks/useLoadAiChatThread';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/composer/states/aiChatComposerNewThreadRecipientsFamilyState';
import { aiChatComposerUploadingFilesFamilyState } from '@/ai-chat/composer/states/aiChatComposerUploadingFilesFamilyState';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';

export const useOpenNewAiChatAsDirectMessage = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { loadAiChatThread } = useLoadAiChatThread();

  const openNewAiChatAsDirectMessage = useCallback(
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
        isNonEmptyArray(
          store.get(
            aiChatComposerUploadingFilesFamilyState.atomFamily({
              threadId: newChatThreadId,
            }),
          ),
        ) ||
        isNonEmptyArray(
          store.get(
            aiChatComposerAttachmentsFamilyState.atomFamily({
              threadId: newChatThreadId,
            }),
          ),
        )
      ) {
        enqueueToast({
          status: 'error',
          children: t`Direct messages don't support attachments.`,
        });

        return;
      }

      const isSendingMessageAtom =
        aiChatThreadReplyIsSendingFamilyState.atomFamily({
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
        const directMessageThread = await loadAiChatThread(
          directMessageThreadId,
        );
        assertIsDefinedOrThrow(directMessageThread);

        if (
          store.get(aiChatComposerDraftsState.atom)[newChatThreadId] ===
          serializedDraft
        ) {
          store.set(aiChatComposerDraftsState.atom, (drafts) => ({
            ...drafts,
            [newChatThreadId]: '',
          }));
          store.set(
            aiChatComposerNewThreadRecipientsFamilyState.atomFamily(
              newChatThreadId,
            ),
            ({ channelId }) => ({
              ...AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
              channelId,
            }),
          );
        }

        return directMessageThreadId;
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [apolloClient, enqueueToast, loadAiChatThread, store],
  );

  return { openNewAiChatAsDirectMessage };
};
