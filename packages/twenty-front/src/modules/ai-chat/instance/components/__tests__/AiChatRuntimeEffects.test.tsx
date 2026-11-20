import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AiChatRuntimeEffects } from '@/ai-chat/instance/components/AiChatRuntimeEffects';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai-chat/states/aiChatOpenThreadIdByInstanceIdState';
import { aiChatUISessionStartTimeState } from '@/ai-chat/states/aiChatUISessionStartTimeState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai-chat/instance/components/AiChatThreadRuntimeEffect', () => ({
  AiChatThreadRuntimeEffect: ({ threadId }: { threadId: string }) => (
    <div data-testid="thread-runtime">{threadId}</div>
  ),
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
    jotaiStore.set(aiChatOpenThreadIdByInstanceIdState.atom, {
      'side-panel': 'thread-1',
      'chat-widget': 'thread-1',
      'inbox-pane': 'thread-2',
    });
  });

  it('should run one chat runtime per open thread', () => {
    renderRuntimeEffects();

    expect(
      screen
        .queryAllByTestId('thread-runtime')
        .map((element) => element.textContent),
    ).toEqual(['thread-1', 'thread-2']);
  });

  it('should not run the chat runtime for a suspended workspace', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    });

    renderRuntimeEffects();

    expect(screen.queryByTestId('thread-runtime')).toBeNull();
  });
});
