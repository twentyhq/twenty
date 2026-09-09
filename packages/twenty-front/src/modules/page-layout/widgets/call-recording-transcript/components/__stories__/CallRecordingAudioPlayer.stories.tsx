import { CallRecordingAudioPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingAudioPlayer';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, spyOn, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { CatalogDecorator, type CatalogStory } from 'twenty-ui/testing';
import { MOCK_CALL_RECORDING_AUDIO_DATA_URI } from './mockCallRecordingAudio';

const meta: Meta<typeof CallRecordingAudioPlayer> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingAudioPlayer',
  component: CallRecordingAudioPlayer,
  args: {
    src: MOCK_CALL_RECORDING_AUDIO_DATA_URI,
    onRetry: fn(async () => {}),
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingAudioPlayer>;

export const Catalog: CatalogStory<Story, typeof CallRecordingAudioPlayer> = {
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: ['ready', 'error'],
          props: (state: string) => ({
            src:
              state === 'error'
                ? 'data:audio/wav,not-a-recording'
                : MOCK_CALL_RECORDING_AUDIO_DATA_URI,
          }),
        },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByRole('slider', { name: 'Seek' })).toBeEnabled();
    expect(await canvas.findByText('Playback failed')).toBeVisible();
    expect(canvas.getByRole('button', { name: /^Retry/ })).toBeEnabled();
  },
};

export const MediaStates: Story = {
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audioElement = canvasElement.querySelector('audio');

    if (!isDefined(audioElement)) {
      throw new Error('Audio player was not rendered');
    }

    await canvas.findByRole('slider', { name: 'Seek' });

    const duration = spyOn(audioElement, 'duration', 'get');

    for (const unknownDuration of [Number.NaN, Number.POSITIVE_INFINITY]) {
      duration.mockReturnValue(unknownDuration);
      fireEvent.durationChange(audioElement);

      expect(await canvas.findByText('--:-- / --:--')).toBeVisible();
      expect(
        canvas.queryByRole('slider', { name: 'Seek' }),
      ).not.toBeInTheDocument();
    }

    duration.mockRestore();
    fireEvent.durationChange(audioElement);

    await canvas.findByRole('slider', { name: 'Seek' });

    fireEvent.play(audioElement);
    fireEvent.waiting(audioElement);

    const pauseButton = await canvas.findByRole('button', { name: 'Pause' });

    expect(pauseButton.querySelector('circle')).toBeInTheDocument();

    fireEvent.pause(audioElement);

    await waitFor(() => {
      const playButton = canvas.getByRole('button', { name: 'Play' });

      expect(playButton.querySelector('circle')).not.toBeInTheDocument();
      expect(canvas.queryByText('Playback failed')).not.toBeInTheDocument();
    });
  },
};
