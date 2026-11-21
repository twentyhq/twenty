import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { Temporal } from 'temporal-polyfill';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AiChatThreadEventStreamEffects } from '@/ai-chat/instance/components/AiChatThreadEventStreamEffects';
import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
import { aiChatUISessionStartTimeState } from '@/ai-chat/states/aiChatUISessionStartTimeState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock(
  '@/ai-chat/instance/components/AiChatThreadEventStreamEffect',
  () => ({
    AiChatThreadEventStreamEffect: ({ threadId }: { threadId: string }) => (
      <div data-testid="thread-runtime">{threadId}</div>
    ),
  }),
);

const renderRuntimeEffects = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AiChatThreadEventStreamEffects />
    </JotaiProvider>,
  );

describe('AiChatThreadEventStreamEffects', () => {
  beforeEach(() => {
    jotaiStore.set(aiChatUISessionStartTimeState.atom, Temporal.Now.instant());
    jotaiStore.set(currentWorkspaceState.atom, null);
    jotaiStore.set(aiChatRequiredThreadListenersState.atom, {
      'side-panel': 'thread-1',
      'chat-widget': 'thread-1',
      'inbox-pane': 'thread-2',
    });
  });

  it('should stream the events of each listened thread once', () => {
    renderRuntimeEffects();

    expect(
      screen
        .queryAllByTestId('thread-runtime')
        .map((element) => element.textContent),
    ).toEqual(['thread-1', 'thread-2']);
  });

  it('should not stream events for a suspended workspace', () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    });

    renderRuntimeEffects();

    expect(screen.queryByTestId('thread-runtime')).toBeNull();
  });
});
