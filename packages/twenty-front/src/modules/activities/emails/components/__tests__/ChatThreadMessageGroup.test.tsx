import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

const buildMessage = (
  overrides: Partial<EmailThreadMessageWithSender>,
): EmailThreadMessageWithSender =>
  ({
    id: 'message-id',
    text: 'See you tomorrow',
    receivedAt: null,
    subject: null,
    headerMessageId: 'app:application-id:channel-id:external-id',
    messageThreadId: 'thread-id',
    isDraft: false,
    messageParticipants: [],
    sender: undefined,
    ...overrides,
  }) as EmailThreadMessageWithSender;

describe('ChatThreadMessageGroup', () => {
  it('renders the text of each message', () => {
    render(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [buildMessage({})],
        }}
      />,
    );

    expect(screen.getByText('See you tomorrow')).toBeInTheDocument();
  });

  it('does not render a body masked by metadata visibility', () => {
    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadMessageGroup
          group={{
            id: 'group-id',
            isOutgoing: true,
            messages: [
              buildMessage({
                text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
              }),
            ],
          }}
        />
      </I18nProvider>,
    );

    expect(screen.getByText('Not shared')).toBeInTheDocument();
    expect(
      screen.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
  });
});
