import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('renders image, video and audio attachments as media', () => {
    render(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: false,
          messages: [
            buildMessage({
              text: '',
              attachments: [
                {
                  fileId: 'image-file-id',
                  label: 'photo.png',
                  extension: '.png',
                  url: 'https://files.test/photo.png',
                },
                {
                  fileId: 'video-file-id',
                  label: 'clip.mp4',
                  extension: '.mp4',
                  url: 'https://files.test/clip.mp4',
                },
                {
                  fileId: 'audio-file-id',
                  label: 'voice-note.m4a',
                  extension: '.m4a',
                  url: 'https://files.test/voice-note.m4a',
                },
              ],
            }),
          ],
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'photo.png' })).toHaveAttribute(
      'src',
      'https://files.test/photo.png',
    );
    expect(screen.getByLabelText('clip.mp4')).toHaveAttribute(
      'src',
      'https://files.test/clip.mp4',
    );
    expect(screen.getByLabelText('voice-note.m4a')).toHaveAttribute(
      'src',
      'https://files.test/voice-note.m4a',
    );
  });

  it('renders other attachments as a file chip next to the text', () => {
    render(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              attachments: [
                {
                  fileId: 'document-file-id',
                  label: 'offer.pdf',
                  extension: '.pdf',
                  url: 'https://files.test/offer.pdf',
                },
              ],
            }),
          ],
        }}
      />,
    );

    expect(screen.getByText('See you tomorrow')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /offer\.pdf/ }),
    ).toBeInTheDocument();
  });

  it('renders no empty text bubble for a message that only holds files', () => {
    const { container } = render(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              text: '',
              attachments: [
                {
                  fileId: 'image-file-id',
                  label: 'photo.png',
                  extension: '.png',
                  url: 'https://files.test/photo.png',
                },
              ],
            }),
          ],
        }}
      />,
    );

    const group = container.firstElementChild;

    expect(group?.children).toHaveLength(1);
    expect(group?.firstElementChild).toContainElement(
      screen.getByRole('img', { name: 'photo.png' }),
    );
  });

  it('falls back to a file chip when the browser cannot play a file', () => {
    render(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              text: '',
              attachments: [
                {
                  fileId: 'video-file-id',
                  label: 'clip.wmv',
                  extension: '.wmv',
                  url: 'https://files.test/clip.wmv',
                },
              ],
            }),
          ],
        }}
      />,
    );

    fireEvent.error(screen.getByLabelText('clip.wmv'));

    expect(
      screen.getByRole('button', { name: /clip\.wmv/ }),
    ).toBeInTheDocument();
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
