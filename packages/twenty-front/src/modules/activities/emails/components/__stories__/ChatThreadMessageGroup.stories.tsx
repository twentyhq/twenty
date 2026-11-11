import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { ChatThreadMessageGroup } from '@/activities/emails/components/ChatThreadMessageGroup';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { MOCK_CALL_RECORDING_AUDIO_DATA_URI } from '@/page-layout/widgets/call-recording-transcript/components/__stories__/mockCallRecordingAudio';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const buildVoiceNoteMessage = (url: string) =>
  ({
    id: 'message-id',
    text: '',
    receivedAt: '2026-11-07T10:52:00.000Z',
    subject: '',
    headerMessageId: 'app:application-id:channel-id:external-id',
    messageThreadId: 'thread-id',
    isDraft: false,
    messageParticipants: [],
    attachments: [
      {
        id: 'attachment-id',
        file: [
          {
            fileId: 'voice-note-file-id',
            label: 'voice-note.wav',
            extension: 'wav',
            url,
          },
        ],
      },
    ],
  }) as unknown as EmailThreadMessageWithSender;

const meta: Meta<typeof ChatThreadMessageGroup> = {
  title: 'Modules/Activities/Emails/ChatThreadMessageGroup',
  component: ChatThreadMessageGroup,
  decorators: [MemoryRouterDecorator, ComponentDecorator, ToastDecorator],
  parameters: { container: { width: 400 } },
};

export default meta;
type Story = StoryObj<typeof ChatThreadMessageGroup>;

export const OutgoingText: Story = {
  args: {
    group: {
      id: 'group-id',
      isOutgoing: true,
      messages: [
        {
          ...buildVoiceNoteMessage(''),
          id: 'short-message-id',
          text: 'Yes, SAML with Okta is included. SCIM too.',
          attachments: [],
        },
        {
          ...buildVoiceNoteMessage(''),
          id: 'long-message-id',
          text: 'Sending the security doc by email for legal, with the audit report and the list of subprocessors attached.',
          attachments: [],
        },
        {
          ...buildVoiceNoteMessage(''),
          id: 'long-token-message-id',
          text: `https://example.com/${'securityauditreport'.repeat(8)}`,
          attachments: [],
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findAllByText(/\d{1,2}:52/)).toHaveLength(3);
    await expect(
      await canvas.findAllByRole('img', { name: 'Sent' }),
    ).toHaveLength(3);
  },
};

export const VoiceNote: Story = {
  args: {
    group: {
      id: 'group-id',
      isOutgoing: false,
      messages: [buildVoiceNoteMessage(MOCK_CALL_RECORDING_AUDIO_DATA_URI)],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: 'Play' }));
    await userEvent.click(await canvas.findByRole('button', { name: 'Pause' }));
    await expect(
      await canvas.findByRole('button', { name: 'Play' }),
    ).toBeVisible();
  },
};

export const UnplayableVoiceNote: Story = {
  args: {
    group: {
      id: 'group-id',
      isOutgoing: false,
      messages: [buildVoiceNoteMessage('data:audio/wav,not-a-recording')],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('voice-note.wav')).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Play' }),
    ).not.toBeInTheDocument();
  },
};

const onReactionToggle = fn();

export const Reactions: Story = {
  args: {
    group: {
      id: 'group-id',
      isOutgoing: true,
      messages: [
        {
          ...buildVoiceNoteMessage(''),
          text: 'Got it, thanks Sundar!',
          attachments: [],
        },
      ],
    },
    reactionsByMessageId: {
      'message-id': [
        {
          emoji: '👍',
          count: 2,
          isOwn: false,
          reactorNames: ['Sundar Pichai', 'Thomas Kurian'],
        },
      ],
    },
    onReactionToggle,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', {
        name: '👍 by Sundar Pichai and Thomas Kurian',
      }),
    );
    await expect(onReactionToggle).toHaveBeenCalledTimes(1);
    await expect(onReactionToggle).toHaveBeenCalledWith('message-id', '👍');
  },
};

export const ReadOnlyReactions: Story = {
  args: { ...Reactions.args, onReactionToggle: undefined },
  play: async ({ canvasElement }) => {
    const reaction = await within(canvasElement).findByRole('button', {
      name: '👍 by Sundar Pichai and Thomas Kurian',
    });

    await expect(reaction).toBeDisabled();
    await userEvent.hover(reaction.parentElement ?? reaction);
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Sundar Pichai and Thomas Kurian');
  },
};
