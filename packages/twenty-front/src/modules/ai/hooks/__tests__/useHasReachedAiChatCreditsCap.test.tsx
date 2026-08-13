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
    currentBillingSubscription: {
      billingSubscriptionItems: [{ hasReachedCurrentPeriodCap }],
    },
  } as never);
};

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

  it('should return true when the thread failed with credits exhausted even though the workspace reports no cap', () => {
    setWorkspaceCap(false);
    setThreadError(
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
      }),
    );

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(true);
  });

  it('should return false when the thread failed with an unrelated error', () => {
    setWorkspaceCap(false);
    setThreadError(new Error('Thread not found'));

    const { result } = renderHasReachedAiChatCreditsCap();

    expect(result.current).toBe(false);
  });
});
