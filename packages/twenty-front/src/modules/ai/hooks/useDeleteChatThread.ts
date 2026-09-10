import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { tipTapDocumentToMarkdown } from 'twenty-shared/utils';
import { DeleteChatThreadDocument } from '~/generated-metadata/graphql';

export const useDeleteChatThread = () => {
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { addErrorToast } = useErrorToast();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();
  const store = useStore();

  const [deleteMutation] = useMutation(DeleteChatThreadDocument);

  const deleteChatThread = async (id: string) => {
    try {
      await deleteMutation({ variables: { id } });

      removeFromDraft({ key: 'agentChatThreads', itemIds: [id] });
      applyChanges();

      const isCurrent = store.get(currentAiChatThreadState.atom) === id;

      if (!isCurrent) {
        return;
      }

      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

      const remaining = sortChatThreadsByLastActivityDesc(
        store
          .get(agentChatVisibleThreadsSelector.atom)
          .filter((thread) => thread.id !== id),
      );
      const draftsByThreadId = store.get(agentChatDraftsByThreadIdState.atom);

      if (remaining.length > 0) {
        const nextThreadId = remaining[0].id;

        setCurrentAiChatThread(nextThreadId);
        projectAiChatThreadToUrl(nextThreadId);
        setAgentChatInput(
          tipTapDocumentToMarkdown(draftsByThreadId[nextThreadId] ?? ''),
        );
      } else {
        setCurrentAiChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
        projectAiChatThreadToUrl(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
        setAgentChatInput(
          tipTapDocumentToMarkdown(
            draftsByThreadId[AGENT_CHAT_NEW_THREAD_DRAFT_KEY] ?? '',
          ),
        );
      }
    } catch (error) {
      addErrorToast(CombinedGraphQLErrors.is(error) ? error : undefined);
    }
  };

  return { deleteChatThread };
};
