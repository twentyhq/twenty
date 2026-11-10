import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';

const Providers = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <ToastProvider>{children}</ToastProvider>
  </I18nProvider>
);

const renderWithProviders = (ui: ReactNode) =>
  render(ui, { wrapper: Providers });

const asAttachments = (
  files: FieldFilesValue[],
): EmailThreadMessageWithSender['attachments'] =>
  files.map((file) => ({ id: `attachment-${file.fileId}`, file: [file] }));

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
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders the text of each message', () => {
    renderWithProviders(
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

  it('shows the time and sent receipt of outgoing messages only', () => {
    const message = buildMessage({ receivedAt: '2026-11-07T10:07:00.000Z' });
    const { rerender } = renderWithProviders(
      <ChatThreadMessageGroup
        group={{ id: 'group-id', isOutgoing: true, messages: [message] }}
      />,
    );

    expect(screen.getByText(/10:07/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Sent' })).toBeInTheDocument();

    rerender(
      <ChatThreadMessageGroup
        group={{ id: 'group-id', isOutgoing: false, messages: [message] }}
      />,
    );

    expect(screen.queryByText(/10:07/)).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Sent' })).not.toBeInTheDocument();
  });

  it('renders image, video and audio attachments as media', () => {
    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: false,
          messages: [
            buildMessage({
              text: '',
              attachments: asAttachments([
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
              ]),
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
    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              attachments: asAttachments([
                {
                  fileId: 'document-file-id',
                  label: 'offer.pdf',
                  extension: '.pdf',
                  url: 'https://files.test/offer.pdf',
                },
              ]),
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

  it('offers no text to copy for a message that only holds files', () => {
    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              text: '',
              attachments: asAttachments([
                {
                  fileId: 'image-file-id',
                  label: 'photo.png',
                  extension: '.png',
                  url: 'https://files.test/photo.png',
                },
              ]),
            }),
          ],
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'photo.png' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Copy to Clipboard' }),
    ).not.toBeInTheDocument();
  });

  it('shows the sender name above an incoming group', () => {
    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: false,
          messages: [
            buildMessage({
              sender: {
                id: 'participant-id',
                displayName: 'Jane Doe',
                handle: 'jane',
              } as EmailThreadMessageWithSender['sender'],
            }),
          ],
        }}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('falls back to a file chip when the browser cannot play a file', () => {
    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              text: '',
              attachments: asAttachments([
                {
                  fileId: 'video-file-id',
                  label: 'clip.wmv',
                  extension: '.wmv',
                  url: 'https://files.test/clip.wmv',
                },
              ]),
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

  it('plays a file again once it gets a new url after failing', () => {
    const renderVideo = (url: string) => (
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              text: '',
              attachments: asAttachments([
                {
                  fileId: 'video-file-id',
                  label: 'clip.mp4',
                  extension: '.mp4',
                  url,
                },
              ]),
            }),
          ],
        }}
      />
    );

    const { rerender } = renderWithProviders(
      renderVideo('https://files.test/expired.mp4'),
    );

    fireEvent.error(screen.getByLabelText('clip.mp4'));
    rerender(renderVideo('https://files.test/refreshed.mp4'));

    expect(screen.getByLabelText('clip.mp4')).toHaveAttribute(
      'src',
      'https://files.test/refreshed.mp4',
    );
  });

  it('downloads nothing when a file without a url is clicked', async () => {
    const fetchSpy = jest.fn();

    global.fetch = fetchSpy;

    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: true,
          messages: [
            buildMessage({
              attachments: asAttachments([
                {
                  fileId: 'document-file-id',
                  label: 'offer.pdf',
                  extension: '.pdf',
                  url: '',
                },
              ]),
            }),
          ],
        }}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /offer\.pdf/ }));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('keeps the sender of an incoming group whose first body is masked', () => {
    renderWithProviders(
      <ChatThreadMessageGroup
        group={{
          id: 'group-id',
          isOutgoing: false,
          messages: [
            buildMessage({
              text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
              sender: {
                id: 'participant-id',
                displayName: 'Jane Doe',
                handle: 'jane',
              } as EmailThreadMessageWithSender['sender'],
            }),
          ],
        }}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Not shared')).toBeInTheDocument();
  });

  it('does not render a body masked by metadata visibility', () => {
    renderWithProviders(
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
      />,
    );

    expect(screen.getByText('Not shared')).toBeInTheDocument();
    expect(
      screen.queryByText(FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED),
    ).not.toBeInTheDocument();
  });
});
