import { MediaAccessSessionRow } from '@/media-access/components/MediaAccessSessionRow';
import { type MediaAccessSession } from '@/media-access/types/MediaAccessSession';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof MediaAccessSessionRow> = {
  title: 'Modules/MediaAccess/MediaAccessSessionRow',
  component: MediaAccessSessionRow,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof MediaAccessSessionRow>;

const buildSession = (
  overrides: Partial<MediaAccessSession>,
): MediaAccessSession => ({
  id: 'recorder-session',
  ownerId: 'recorder',
  ownerName: 'Recorder',
  status: 'capturing',
  mediaTypes: [],
  onStop: fn(),
  ...overrides,
});

export const CapturedMediaTypes: Story = {
  render: () => (
    <div role="list">
      <MediaAccessSessionRow
        sessions={[buildSession({ mediaTypes: ['audio'] })]}
      />
      <MediaAccessSessionRow
        sessions={[buildSession({ mediaTypes: ['video'] })]}
      />
      <MediaAccessSessionRow
        sessions={[buildSession({ mediaTypes: ['audio', 'video'] })]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Microphone')).toBeVisible();
    await expect(canvas.getByText('Camera')).toBeVisible();
    await expect(canvas.getByText('Microphone and camera')).toBeVisible();
    await expect(
      canvas.getAllByRole('button', { name: 'Stop capture for Recorder' }),
    ).toHaveLength(3);
  },
};

export const WaitingForPermission: Story = {
  render: () => (
    <div role="list">
      <MediaAccessSessionRow
        sessions={[
          buildSession({ status: 'pending', mediaTypes: ['audio', 'video'] }),
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Waiting for permission')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Cancel media request for Recorder' }),
    ).toBeVisible();
  },
};

const stopAudioCapture = fn();
const stopVideoCapture = fn();

export const StopsEverySessionOfTheApplication: Story = {
  render: () => (
    <div role="list">
      <MediaAccessSessionRow
        sessions={[
          buildSession({
            mediaTypes: ['audio'],
            onStop: stopAudioCapture,
          }),
          buildSession({
            id: 'recorder-video',
            mediaTypes: ['video'],
            onStop: stopVideoCapture,
          }),
        ]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Microphone and camera')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Stop capture for Recorder' }),
    );

    await expect(stopAudioCapture).toHaveBeenCalledTimes(1);
    await expect(stopVideoCapture).toHaveBeenCalledTimes(1);
  },
};
