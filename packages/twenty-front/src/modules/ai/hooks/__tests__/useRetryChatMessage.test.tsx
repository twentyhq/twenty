import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';

import { useRetryChatMessage } from '@/ai/hooks/useRetryChatMessage';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isResourceCreditSubscriptionItem } from '@/workspace/utils/isResourceCreditSubscriptionItem';
import { RetryChatMessageDocument } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const THREAD_ID = 'thread-id';

const buildRetryChatMessageMock = ({
  isIncluded,
}: {
  isIncluded: boolean;
}): MockedResponse => ({
  request: { query: RetryChatMessageDocument, variables: () => true },
  result: {
    data: {
      retryChatMessage: {
        messageId: 'message-id',
        queued: false,
        streamId: 'stream-id',
        isIncluded,
      },
    },
  },
});

const hasReachedCreditsCap = () =>
  jotaiStore
    .get(currentWorkspaceState.atom)
    ?.currentBillingSubscription?.billingSubscriptionItems?.find(
      isResourceCreditSubscriptionItem,
    )?.hasReachedCurrentPeriodCap === true;

const retryWithCreditsCapReached = async ({
  isIncluded,
}: {
  isIncluded: boolean;
}) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [buildRetryChatMessageMock({ isIncluded })],
    onInitializeJotaiStore: (store) => {
      store.set(agentChatDisplayedThreadState.atom, THREAD_ID);
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        currentBillingSubscription: {
          ...mockCurrentWorkspace.currentBillingSubscription,
          billingSubscriptionItems:
            mockCurrentWorkspace.currentBillingSubscription.billingSubscriptionItems.map(
              (billingSubscriptionItem) => ({
                ...billingSubscriptionItem,
                hasReachedCurrentPeriodCap: true,
              }),
            ),
        },
      });
    },
  });

  const { result } = renderHook(() => useRetryChatMessage(), {
    wrapper: Wrapper,
  });

  await act(async () => {
    await result.current.retryChatMessage();
  });
};

describe('useRetryChatMessage', () => {
  it('takes a billed retry as proof the workspace has credits again', async () => {
    await retryWithCreditsCapReached({ isIncluded: false });

    expect(hasReachedCreditsCap()).toBe(false);
  });

  it('keeps the workspace out of credits after a retry on the included model', async () => {
    await retryWithCreditsCapReached({ isIncluded: true });

    expect(hasReachedCreditsCap()).toBe(true);
  });
});
