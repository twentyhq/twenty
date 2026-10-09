import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { agentChatUISessionStartTimeState } from '@/ai/states/agentChatUISessionStartTimeState';
import {
  currentWorkspaceState,
  type CurrentWorkspace,
} from '@/auth/states/currentWorkspaceState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/AgentChatMessagesFetchEffect', () => ({
  AgentChatMessagesFetchEffect: () => null,
}));
jest.mock('@/ai/components/AgentChatStreamSubscriptionEffect', () => ({
  AgentChatStreamSubscriptionEffect: () => (
    <div data-testid="stream-subscription" />
  ),
}));
jest.mock('@/ai/components/AgentChatPrepromptEffect', () => ({
  AgentChatPrepromptEffect: () => null,
}));
jest.mock('@/ai/components/AgentChatStreamKeepAliveEffect', () => ({
  AgentChatStreamKeepAliveEffect: () => null,
}));

const renderRuntimeEffects = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AgentChatRuntimeEffects />
    </JotaiProvider>,
  );

describe('AgentChatRuntimeEffects', () => {
  beforeEach(() => {
    jotaiStore.set(
      agentChatUISessionStartTimeState.atom,
      Temporal.Now.instant(),
    );
    jotaiStore.set(currentWorkspaceState.atom, null);
  });

  it('should run the chat runtime once the chat has been opened', () => {
    renderRuntimeEffects();

    expect(screen.queryByTestId('stream-subscription')).not.toBeNull();
  });

  it('should not run the chat runtime for a suspended workspace', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    } as CurrentWorkspace);

    renderRuntimeEffects();

    expect(screen.queryByTestId('stream-subscription')).toBeNull();
  });
});
