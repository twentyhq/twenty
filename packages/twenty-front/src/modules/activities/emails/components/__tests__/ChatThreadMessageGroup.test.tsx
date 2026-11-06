import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import {
  CalendarStartDay,
  FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
} from 'twenty-shared/constants';
import { MessageDeliveryStatus } from 'twenty-shared/types';

import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { DateFormat } from '@/localization/constants/DateFormat';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { workspaceMemberFormatPreferencesState } from '@/localization/states/workspaceMemberFormatPreferencesState';
import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

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
    render(
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

  it('renders no empty text bubble for a message that only holds files', () => {
    const { container } = render(
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

    const { rerender } = render(renderVideo('https://files.test/expired.mp4'));

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

    render(
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

  it.each([
    [TimeFormat.HOUR_24, '14:07'],
    [TimeFormat.HOUR_12, '2:07 PM'],
  ])(
    'renders the time of each message in the member time format (%s)',
    (timeFormat, expectedTime) => {
      jotaiStore.set(workspaceMemberFormatPreferencesState.atom, {
        timeZone: 'Europe/Paris',
        dateFormat: DateFormat.MONTH_FIRST,
        timeFormat,
        numberFormat: NumberFormat.COMMAS_AND_DOT,
        calendarStartDay: CalendarStartDay.MONDAY,
      });

      render(
        <JotaiProvider store={jotaiStore}>
          <ChatThreadMessageGroup
            group={{
              id: 'group-id',
              isOutgoing: true,
              messages: [
                buildMessage({ receivedAt: '2026-01-05T13:07:00.000Z' }),
              ],
            }}
          />
        </JotaiProvider>,
      );

      expect(screen.getByText(expectedTime)).toBeInTheDocument();
    },
  );

  it.each([
    [MessageDeliveryStatus.SENT, 'Sent'],
    [MessageDeliveryStatus.DELIVERED, 'Delivered'],
    [MessageDeliveryStatus.READ, 'Read'],
  ])(
    'shows the %s status of an outgoing message',
    (deliveryStatus, expectedLabel) => {
      render(
        <I18nProvider i18n={i18n}>
          <ChatThreadMessageGroup
            group={{
              id: 'group-id',
              isOutgoing: true,
              messages: [buildMessage({ deliveryStatus })],
            }}
          />
        </I18nProvider>,
      );

      expect(screen.getByLabelText(expectedLabel)).toBeInTheDocument();
    },
  );

  it('shows no status on an incoming message', () => {
    render(
      <I18nProvider i18n={i18n}>
        <ChatThreadMessageGroup
          group={{
            id: 'group-id',
            isOutgoing: false,
            messages: [
              buildMessage({ deliveryStatus: MessageDeliveryStatus.READ }),
            ],
          }}
        />
      </I18nProvider>,
    );

    expect(screen.queryByLabelText('Read')).not.toBeInTheDocument();
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
