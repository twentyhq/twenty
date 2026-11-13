import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AiChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { aiChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/AgentChatMessagesFetchEffect', () => ({
  AiChatMessagesFetchEffect: () => null,
}));
jest.mock('@/ai/components/AgentChatStreamSubscriptionEffect', () => ({
  AiChatStreamSubscriptionEffect: () => (
    <div data-testid="stream-subscription" />
  ),
}));
jest.mock('@/ai/components/AgentChatPrepromptEffect', () => ({
  AiChatPrepromptEffect: () => null,
}));

const renderRuntimeEffects = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AiChatRuntimeEffects />
    </JotaiProvider>,
  );

describe('AiChatRuntimeEffects', () => {
  beforeEach(() => {
    jotaiStore.set(aiChatUISessionStartTimeState.atom, Temporal.Now.instant());
    jotaiStore.set(currentWorkspaceState.atom, null);
  });

  it('should run the chat runtime once the chat has been opened', () => {
    renderRuntimeEffects();

    expect(screen.queryByTestId('stream-subscription')).not.toBeNull();
  });

  it('should not run the chat runtime for a suspended workspace', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    });

    renderRuntimeEffects();

    expect(screen.queryByTestId('stream-subscription')).toBeNull();
  });
});
