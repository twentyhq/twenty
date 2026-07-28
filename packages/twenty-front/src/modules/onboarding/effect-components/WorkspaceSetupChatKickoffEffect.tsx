import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { WORKSPACE_SETUP_CHAT_THREAD_TITLE } from 'twenty-shared/ai';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { workspaceSetupChatRequestedWorkspaceIdState } from '@/onboarding/states/workspaceSetupChatRequestedWorkspaceIdState';
import {
  StartWorkspaceSetupChatDocument,
  WorkspaceSetupChatOutcome,
} from '~/generated-metadata/graphql';

export const WorkspaceSetupChatKickoffEffect = () => {
  const [startWorkspaceSetupChatMutation] = useMutation(
    StartWorkspaceSetupChatDocument,
  );
  const store = useStore();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  useEffect(() => {
    const workspaceId = store.get(currentWorkspaceState.atom)?.id;

    if (
      !isDefined(workspaceId) ||
      store.get(workspaceSetupChatRequestedWorkspaceIdState.atom) ===
        workspaceId
    ) {
      return;
    }

    store.set(workspaceSetupChatRequestedWorkspaceIdState.atom, workspaceId);

    const releaseKickoffGuardForRetry = () => {
      if (
        store.get(workspaceSetupChatRequestedWorkspaceIdState.atom) ===
        workspaceId
      ) {
        store.set(workspaceSetupChatRequestedWorkspaceIdState.atom, null);
      }
    };

    const startWorkspaceSetupChat = async () => {
      try {
        const { data } = await startWorkspaceSetupChatMutation({
          variables: {
            companyContext: store.get(companyEnrichmentState.atom) ?? undefined,
          },
        });

        const result = data?.startWorkspaceSetupChat;

        if (!isDefined(result)) {
          releaseKickoffGuardForRetry();

          return;
        }

        const { threadId } = result;

        if (
          result.outcome === WorkspaceSetupChatOutcome.unavailable ||
          !isDefined(threadId) ||
          !isValidUuid(threadId)
        ) {
          return;
        }

        const nowIsoString = new Date().toISOString();
        const workspaceSetupThread: FlatAgentChatThread = {
          id: threadId,
          title: WORKSPACE_SETUP_CHAT_THREAD_TITLE,
          createdAt: nowIsoString,
          updatedAt: nowIsoString,
          conversationSize: 0,
          contextWindowTokens: null,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalInputCredits: 0,
          totalOutputCredits: 0,
        };

        addToDraft({ key: 'agentChatThreads', items: [workspaceSetupThread] });
        applyChanges();

        store.set(
          currentAiChatThreadTitleComponentFamilyState.atomFamily({
            instanceId: AGENT_CHAT_INSTANCE_ID,
            familyKey: { threadId },
          }),
          WORKSPACE_SETUP_CHAT_THREAD_TITLE,
        );

        if (result.outcome === WorkspaceSetupChatOutcome.started) {
          store.set(
            agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
              instanceId: AGENT_CHAT_INSTANCE_ID,
              familyKey: { threadId },
            }),
            true,
          );
        }

        store.set(hasInitializedAgentChatThreadsState.atom, true);
        store.set(skipMessagesSkeletonUntilLoadedState.atom, true);
        store.set(currentAiChatThreadState.atom, threadId);
      } catch {
        // A transient failure must not permanently consume the guard: the server
        // side is idempotent, so a reload can retry the kickoff.
        releaseKickoffGuardForRetry();

        return;
      }
    };

    void startWorkspaceSetupChat();
  }, [startWorkspaceSetupChatMutation, store, addToDraft, applyChanges]);

  return null;
};
