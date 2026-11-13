import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useRefreshAiChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasInitializedAiChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { WORKSPACE_SETUP_CHAT_ENRICHMENT_MAX_WAIT_MS } from '@/onboarding/constants/WorkspaceSetupChatEnrichmentMaxWaitMs';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasRequestedWorkspaceSetupChatState } from '@/onboarding/states/hasRequestedWorkspaceSetupChatState';
import { isCompanyEnrichmentFetchInFlightState } from '@/onboarding/states/isCompanyEnrichmentFetchInFlightState';
import { personEnrichmentState } from '@/onboarding/states/personEnrichmentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  StartWorkspaceSetupChatDocument,
  WorkspaceSetupChatOutcome,
} from '~/generated-metadata/graphql';

export const WorkspaceSetupChatKickoffEffect = () => {
  const [startWorkspaceSetupChatMutation] = useMutation(
    StartWorkspaceSetupChatDocument,
  );
  const store = useStore();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const { addAiChatThread } = useApplyAiChatThreadUpdate();
  const isCompanyEnrichmentFetchInFlight = useAtomStateValue(
    isCompanyEnrichmentFetchInFlightState,
  );
  const [hasWaitedForCompanyEnrichment, setHasWaitedForCompanyEnrichment] =
    useState(false);

  useEffect(() => {
    const waitTimer = setTimeout(
      () => setHasWaitedForCompanyEnrichment(true),
      WORKSPACE_SETUP_CHAT_ENRICHMENT_MAX_WAIT_MS,
    );

    return () => clearTimeout(waitTimer);
  }, []);

  useEffect(() => {
    const shouldWaitForCompanyEnrichment =
      isCompanyEnrichmentFetchInFlight && !hasWaitedForCompanyEnrichment;

    if (
      shouldWaitForCompanyEnrichment ||
      store.get(hasRequestedWorkspaceSetupChatState.atom)
    ) {
      return;
    }

    store.set(hasRequestedWorkspaceSetupChatState.atom, true);

    const startWorkspaceSetupChat = async () => {
      try {
        const { data } = await startWorkspaceSetupChatMutation({
          variables: {
            companyContext: store.get(companyEnrichmentState.atom) ?? undefined,
            personContext: store.get(personEnrichmentState.atom) ?? undefined,
          },
        });

        const result = data?.startWorkspaceSetupChat;
        const thread = result?.thread;

        if (!isDefined(result)) {
          store.set(hasRequestedWorkspaceSetupChatState.atom, false);

          return;
        }

        if (
          result.outcome === WorkspaceSetupChatOutcome.UNAVAILABLE ||
          !isDefined(thread)
        ) {
          return;
        }

        if (!store.get(shouldOpenAiChatAfterOnboardingState.atom)) {
          return;
        }

        addAiChatThread({
          id: thread.id,
          title: thread.title ?? null,
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
          deletedAt: null,
        });
        void refreshAiChatThreadPermissions([thread.id]);

        if (result.outcome === WorkspaceSetupChatOutcome.STARTED) {
          store.set(
            aiChatIsAwaitingFirstChunkFamilyState.atomFamily({
              threadId: thread.id,
            }),
            true,
          );
        }

        store.set(hasInitializedAiChatThreadsState.atom, true);
        store.set(skipMessagesSkeletonUntilLoadedState.atom, true);
        store.set(currentAiChatThreadState.atom, thread.id);
      } catch {
        store.set(hasRequestedWorkspaceSetupChatState.atom, false);

        return;
      }
    };

    void startWorkspaceSetupChat();
  }, [
    startWorkspaceSetupChatMutation,
    refreshAiChatThreadPermissions,
    store,
    addAiChatThread,
    isCompanyEnrichmentFetchInFlight,
    hasWaitedForCompanyEnrichment,
  ]);

  return null;
};
