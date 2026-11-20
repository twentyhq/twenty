import { render, screen } from '@testing-library/react';

import { AiChatThreadRecordPage } from '@/inbox/components/AiChatThreadRecordPage';

let mockIsAiChatInboxEnabled = true;
let mockWorkspaceSurfaceType = 'main';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
}));

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsAiChatInboxEnabled,
}));

jest.mock('@/ui/layout/hooks/useWorkspaceSurface', () => ({
  useWorkspaceSurface: () => ({ type: mockWorkspaceSurfaceType }),
}));

jest.mock('@/inbox/components/AiChatThreadPageContent', () => ({
  AiChatThreadPageContent: ({ threadId }: { threadId: string }) => (
    <div data-testid="chat-thread">{threadId}</div>
  ),
}));

describe('AiChatThreadRecordPage', () => {
  beforeEach(() => {
    mockWorkspaceSurfaceType = 'main';
  });

  it.each([
    [true, '/inbox/chat-1'],
    [false, '/chat/chat-1'],
  ])(
    'sends a chat record with the inbox on=%s to %s',
    (isAiChatInboxEnabled, expectedPath) => {
      mockIsAiChatInboxEnabled = isAiChatInboxEnabled;

      render(<AiChatThreadRecordPage objectRecordId="chat-1" />);

      expect(screen.getByTestId('navigate')).toHaveTextContent(expectedPath);
    },
  );

  it('shows the chat in place in the side panel', () => {
    mockWorkspaceSurfaceType = 'side-panel';

    render(<AiChatThreadRecordPage objectRecordId="chat-1" />);

    expect(screen.getByTestId('chat-thread')).toHaveTextContent('chat-1');
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});
