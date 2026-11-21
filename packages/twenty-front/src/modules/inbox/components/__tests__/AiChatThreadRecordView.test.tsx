import { render, screen } from '@testing-library/react';

import { AiChatThreadRecordView } from '@/inbox/components/AiChatThreadRecordView';

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

jest.mock('@/inbox/components/InboxThreadPageContent', () => ({
  InboxThreadPageContent: ({ threadId }: { threadId: string }) => (
    <div data-testid="inbox-thread">{threadId}</div>
  ),
}));

jest.mock('@/ai-chat/instance/components/AiChatThreadPageContent', () => ({
  AiChatThreadPageContent: ({ threadId }: { threadId: string }) => (
    <div data-testid="chat-thread">{threadId}</div>
  ),
}));

describe('AiChatThreadRecordView', () => {
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

      render(<AiChatThreadRecordView objectRecordId="chat-1" />);

      expect(screen.getByTestId('navigate')).toHaveTextContent(expectedPath);
    },
  );

  it.each([
    [true, 'inbox-thread'],
    [false, 'chat-thread'],
  ])(
    'shows the chat in place in the side panel with the inbox on=%s',
    (isAiChatInboxEnabled, expectedTestId) => {
      mockIsAiChatInboxEnabled = isAiChatInboxEnabled;
      mockWorkspaceSurfaceType = 'side-panel';

      render(<AiChatThreadRecordView objectRecordId="chat-1" />);

      expect(screen.getByTestId(expectedTestId)).toHaveTextContent('chat-1');
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    },
  );
});
