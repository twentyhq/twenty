import { render, screen } from '@testing-library/react';

import { MessageThreadSidePanelTitle } from '@/activities/emails/components/MessageThreadSidePanelTitle';
import { MessageChannelType } from '~/generated/graphql';

const mockUseMessageThreadChannel = jest.fn();

jest.mock('@/activities/emails/hooks/useMessageThreadChannel', () => ({
  useMessageThreadChannel: () => mockUseMessageThreadChannel(),
}));

jest.mock('@/activities/emails/hooks/useEmailThread', () => ({
  useEmailThread: () => ({ messages: [] }),
}));

jest.mock('@/activities/emails/hooks/useChatThreadCounterparts', () => ({
  useChatThreadCounterparts: () => [
    {
      handle: 'sundar@google.com',
      displayName: 'Sundar Pichai',
      person: { id: 'person-id', avatarUrl: null },
      workspaceMember: null,
    },
  ],
}));

const renderTitle = () =>
  render(
    <MessageThreadSidePanelTitle
      messageThreadId="thread-id"
      emailThreadTitle={<span>Email subject</span>}
    />,
  );

const mockChannel = ({
  type,
  messageThreadChannelLoading = false,
}: {
  type: MessageChannelType | null;
  messageThreadChannelLoading?: boolean;
}) =>
  mockUseMessageThreadChannel.mockReturnValue({
    messageThreadChannel:
      type === null
        ? null
        : {
            type,
            provider: 'whatsapp',
            applicationId: null,
            conversationStyle:
              type === MessageChannelType.APP ? 'chat' : 'email',
          },
    messageThreadChannelLoading,
  });

describe('MessageThreadSidePanelTitle', () => {
  it('should show the counterpart avatar and name on an app chat', () => {
    mockChannel({ type: MessageChannelType.APP });

    renderTitle();

    expect(screen.getByText('S')).toBeVisible();
    expect(screen.getByText('Sundar Pichai')).toBeVisible();
    expect(screen.queryByText('Email subject')).not.toBeInTheDocument();
  });

  it('should keep the record title on an email thread', () => {
    mockChannel({ type: MessageChannelType.EMAIL });

    renderTitle();

    expect(screen.getByText('Email subject')).toBeVisible();
    expect(screen.queryByText('Sundar Pichai')).not.toBeInTheDocument();
  });

  it('should keep the record title when the channel is unknown', () => {
    mockChannel({ type: null });

    renderTitle();

    expect(screen.getByText('Email subject')).toBeVisible();
  });

  it('should render nothing while the channel is loading', () => {
    mockChannel({ type: null, messageThreadChannelLoading: true });

    const { container } = renderTitle();

    expect(container).toBeEmptyDOMElement();
  });
});
