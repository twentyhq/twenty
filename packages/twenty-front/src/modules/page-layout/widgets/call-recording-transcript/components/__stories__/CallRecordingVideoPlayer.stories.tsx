import { CallRecordingVideoPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingVideoPlayer';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CallRecordingVideoPlayer> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingVideoPlayer',
  component: CallRecordingVideoPlayer,
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
    ComponentDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
  args: {
    onTimeUpdate: () => {},
    onRetry: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingVideoPlayer>;

export const PlaybackError: Story = {
  args: {
    src: 'data:video/mp4,not-a-video',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Playback failed');
    await canvas.findByText('Retry');
  },
};
