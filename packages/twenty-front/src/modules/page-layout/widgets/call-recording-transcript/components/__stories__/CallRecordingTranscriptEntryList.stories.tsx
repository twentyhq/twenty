import { CallRecordingTranscriptEntryList } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryList';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CallRecordingTranscriptEntryList> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingTranscriptEntryList',
  component: CallRecordingTranscriptEntryList,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
    container: { width: 500 },
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingTranscriptEntryList>;

export const Default: Story = {
  args: {
    entries: [
      {
        speakerName: 'Ada Lovelace',
        startSeconds: 12,
        endSeconds: 21,
        text: 'Thanks for joining, let us walk through the quarterly numbers.',
        words: [],
      },
      {
        speakerName: 'Grace Hopper',
        startSeconds: 24,
        endSeconds: 40,
        text: 'Happy to. Pipeline grew twenty percent since the last call.',
        words: [],
      },
      {
        speakerName: 'Ada Lovelace',
        startSeconds: 3675,
        endSeconds: 3690,
        text: 'Let us wrap up and send the follow-ups tomorrow.',
        words: [],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Grace Hopper');
    await canvas.findByText(
      'Thanks for joining, let us walk through the quarterly numbers.',
    );
  },
};

export const WithoutSpeakerAndTimestamps: Story = {
  args: {
    entries: [
      {
        speakerName: undefined,
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Inaudible segment without speaker attribution.',
        words: [],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Inaudible segment without speaker attribution.');
  },
};

export const WithLongUnbrokenToken: Story = {
  args: {
    entries: [
      {
        speakerName: 'Ada Lovelace',
        startSeconds: 5,
        endSeconds: 9,
        text: `The staging link is https://very-long-subdomain.example.com/${'a'.repeat(120)}`,
        words: [],
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText(/very-long-subdomain/);
  },
};
