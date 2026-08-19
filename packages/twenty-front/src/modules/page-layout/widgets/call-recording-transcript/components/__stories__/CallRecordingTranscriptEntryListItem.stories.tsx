import { CallRecordingTranscriptEntryListItem } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryListItem';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CallRecordingTranscriptEntryListItem> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingTranscriptEntryListItem',
  component: CallRecordingTranscriptEntryListItem,
  decorators: [ComponentDecorator],
  parameters: {
    layout: 'centered',
    container: { width: 500 },
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingTranscriptEntryListItem>;

export const Default: Story = {
  args: {
    entry: {
      speakerName: 'Ada Lovelace',
      startSeconds: 12,
      endSeconds: 21,
      text: 'Thanks for joining, let us walk through the quarterly numbers.',
      words: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Ada Lovelace');
    await canvas.findByText(
      'Thanks for joining, let us walk through the quarterly numbers.',
    );
  },
};

export const WithHourLongTimestamp: Story = {
  args: {
    entry: {
      speakerName: 'Grace Hopper',
      startSeconds: 3675,
      endSeconds: 3690,
      text: 'Let us wrap up and send the follow-ups tomorrow.',
      words: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Grace Hopper');
    await canvas.findByText('Let us wrap up and send the follow-ups tomorrow.');
  },
};

export const WithoutSpeaker: Story = {
  args: {
    entry: {
      speakerName: undefined,
      startSeconds: undefined,
      endSeconds: undefined,
      text: 'Inaudible segment without speaker attribution.',
      words: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Inaudible segment without speaker attribution.');
  },
};
