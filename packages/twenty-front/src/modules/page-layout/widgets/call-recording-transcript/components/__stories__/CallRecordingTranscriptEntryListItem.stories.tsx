import { CallRecordingTranscriptEntryListItem } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptEntryListItem';
import { type Meta, type StoryObj } from '@storybook/react-vite';
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
};
