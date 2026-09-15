import { CallRecordingAudioPlayer } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingAudioPlayer';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  expect,
  fireEvent,
  fn,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from 'twenty-ui/testing';
import { MOCK_CALL_RECORDING_AUDIO_DATA_URI } from './mockCallRecordingAudio';

const meta: Meta<typeof CallRecordingAudioPlayer> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingAudioPlayer',
  component: CallRecordingAudioPlayer,
  args: {
    src: MOCK_CALL_RECORDING_AUDIO_DATA_URI,
    onRetry: fn(async () => {}),
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <CallRecordingAudioPlayer {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof CallRecordingAudioPlayer>;

export const Catalog: CatalogStory<Story, typeof CallRecordingAudioPlayer> = {
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      options: {
        elementContainer: { style: { width: 320, display: 'block' } },
      },
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
  decorators: [ComponentDecorator],
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

export const KeyboardSeeking: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audioElement = canvasElement.querySelector('audio');

    if (!isDefined(audioElement)) {
      throw new Error('Audio player was not rendered');
    }

    const slider = await canvas.findByRole('slider', { name: 'Seek' });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');

    await waitFor(() => expect(audioElement.currentTime).toBeCloseTo(0.1));
    await expect(slider).toHaveValue('0.1');

    await userEvent.keyboard('{End}');
    await waitFor(() =>
      expect(audioElement.currentTime).toBeCloseTo(audioElement.duration),
    );
  },
};

export const DragSeeking: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audioElement = canvasElement.querySelector('audio');

    if (!isDefined(audioElement)) {
      throw new Error('Audio player was not rendered');
    }

    const slider = await canvas.findByRole<HTMLInputElement>('slider', {
      name: 'Seek',
    });
    const pointer = userEvent.setup();
    const bounds = slider.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    await pointer.pointer({
      target: slider,
      keys: '[MouseLeft>]',
      coords: { x: bounds.left, y },
    });
    await pointer.pointer({
      target: slider,
      coords: { x: bounds.left + 50, y },
    });

    const previewTime = slider.valueAsNumber;

    await expect(previewTime).toBeGreaterThan(0);
    await expect(audioElement.currentTime).toBe(0);
    fireEvent.timeUpdate(audioElement);
    await expect(slider).toHaveValue(String(previewTime));

    await pointer.pointer({ target: slider, keys: '[/MouseLeft]' });
    await waitFor(() =>
      expect(audioElement.currentTime).toBeCloseTo(previewTime),
    );

    audioElement.currentTime = 1;
    fireEvent.timeUpdate(audioElement);
    await waitFor(() => expect(slider).toHaveValue('1'));
  },
};
