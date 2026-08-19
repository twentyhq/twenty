import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { useHasReachedAiChatCreditsCap } from '@/ai/hooks/useHasReachedAiChatCreditsCap';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatErrorComponentFamilyState } from '@/ai/states/agentChatErrorComponentFamilyState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const INSTANCE_ID = 'useHasReachedAiChatCreditsCapTest';
const THREAD_ID = 'thread-1';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

const setThreadError = (error: Error | CombinedGraphQLErrors) => {
  jotaiStore.set(
    agentChatErrorComponentFamilyState.atomFamily({
      instanceId: INSTANCE_ID,
      familyKey: { threadId: THREAD_ID },
    }),
    error,
  );
};

const setWorkspaceCap = (hasReachedCurrentPeriodCap: boolean) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    currentBillingSubscription: {
      ...mockCurrentWorkspace.currentBillingSubscription,
      billingSubscriptionItems:
        mockCurrentWorkspace.currentBillingSubscription.billingSubscriptionItems.map(
          (billingSubscriptionItem) => ({
            ...billingSubscriptionItem,
            hasReachedCurrentPeriodCap,
          }),
        ),
    },
  });
};

const setWorkspaceWithoutBillingSubscription = () => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    currentBillingSubscription: undefined,
  });
};

const creditsExhaustedError = () =>
  new CombinedGraphQLErrors({
    errors: [
      {
        message: 'Credits exhausted',
        extensions: {
          code: 'FORBIDDEN',
          subCode: 'BILLING_CREDITS_EXHAUSTED',
        },
      },
    ],
    data: null,
  });

const renderHasReachedAiChatCreditsCap = () =>
  renderHook(() => useHasReachedAiChatCreditsCap(), { wrapper: Wrapper });

describe('useHasReachedAiChatCreditsCap', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
  });

  it('should return false when the workspace has credits left and the thread has no error', () => {
    setWorkspaceCap(false);

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(false);
  });

  it('should return true when the workspace subscription item reports the cap', () => {
    setWorkspaceCap(true);

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(true);
  });

  it('should trust the cleared workspace flag over a leftover thread error after an upgrade', () => {
    setWorkspaceCap(false);
    setThreadError(creditsExhaustedError());

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(false);
  });

  it('should fall back to the thread error when the workspace state has no resource credit item', () => {
    setWorkspaceWithoutBillingSubscription();
    setThreadError(creditsExhaustedError());

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(true);
  });

  it('should return false for an unrelated thread error when the workspace state has no resource credit item', () => {
    setWorkspaceWithoutBillingSubscription();
    setThreadError(new Error('Thread not found'));

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(false);
  });
});
