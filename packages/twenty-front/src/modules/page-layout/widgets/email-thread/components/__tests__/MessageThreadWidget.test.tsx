import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { MessageThreadWidget } from '@/page-layout/widgets/email-thread/components/MessageThreadWidget';
import { MessageChannelType } from '~/generated/graphql';

const mockUseMessageThreadChannel = jest.fn();

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({ id: 'thread-id' }),
}));

jest.mock('@/activities/emails/hooks/useEmailThread', () => ({
  useEmailThread: () => ({
    thread: { id: 'thread-id' },
    messages: [{ id: 'message-id' }],
    fetchMoreMessages: jest.fn(),
    threadLoading: false,
  }),
}));

jest.mock('@/activities/emails/hooks/useMessageThreadChannel', () => ({
  useMessageThreadChannel: () => mockUseMessageThreadChannel(),
}));

jest.mock(
  '@/page-layout/widgets/email-thread/components/ChatThreadWidgetContent',
  () => ({ ChatThreadWidgetContent: () => <div>Chat thread</div> }),
);

jest.mock(
  '@/page-layout/widgets/email-thread/components/EmailThreadWidget',
  () => ({ EmailThreadWidget: () => <div>Email thread</div> }),
);

const renderWidget = () =>
  render(
    <I18nProvider i18n={i18n}>
      <MessageThreadWidget widget={{} as PageLayoutWidget} />
    </I18nProvider>,
  );

describe('MessageThreadWidget', () => {
  it.each([MessageChannelType.APP, MessageChannelType.SMS])(
    'renders %s threads as a chat',
    (type) => {
      mockUseMessageThreadChannel.mockReturnValue({
        messageThreadChannel: { type, provider: 'app', applicationId: null },
        messageThreadChannelLoading: false,
      });

      renderWidget();

      expect(screen.getByText('Chat thread')).toBeInTheDocument();
    },
  );

  it('renders email threads as an email thread', () => {
    mockUseMessageThreadChannel.mockReturnValue({
      messageThreadChannel: {
        type: MessageChannelType.EMAIL,
        provider: 'google',
        applicationId: null,
      },
      messageThreadChannelLoading: false,
    });

    renderWidget();

    expect(screen.getByText('Email thread')).toBeInTheDocument();
  });
});
