import { FrontComponentMediaSessionTooltipRow } from '@/front-components/media-session/components/FrontComponentMediaSessionTooltipRow';
import { type FrontComponentMediaSessionStatus } from '@/front-components/media-session/types/FrontComponentMediaSessionStatus';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof FrontComponentMediaSessionTooltipRow> = {
  title: 'Modules/FrontComponents/FrontComponentMediaSessionTooltipRow',
  component: FrontComponentMediaSessionTooltipRow,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof FrontComponentMediaSessionTooltipRow>;

const buildSession = (
  overrides: Partial<FrontComponentMediaSessionStatus>,
): FrontComponentMediaSessionStatus => ({
  id: 'recorder-session',
  applicationId: 'recorder',
  applicationName: 'Recorder',
  activeMediaTypes: [],
  pendingMediaTypes: [],
  onStop: fn(),
  ...overrides,
});

export const CapturedMediaTypes: Story = {
  render: () => (
    <div role="list">
      <FrontComponentMediaSessionTooltipRow
        sessions={[buildSession({ activeMediaTypes: ['audio'] })]}
      />
      <FrontComponentMediaSessionTooltipRow
        sessions={[buildSession({ activeMediaTypes: ['video'] })]}
      />
      <FrontComponentMediaSessionTooltipRow
        sessions={[buildSession({ activeMediaTypes: ['audio', 'video'] })]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Microphone')).toBeVisible();
    await expect(canvas.getByText('Camera')).toBeVisible();
    await expect(canvas.getByText('Microphone and camera')).toBeVisible();
    await expect(
      canvas.getAllByRole('button', { name: 'Stop recording for Recorder' }),
    ).toHaveLength(3);
  },
};

export const WaitingForPermission: Story = {
  render: () => (
    <div role="list">
      <FrontComponentMediaSessionTooltipRow
        sessions={[buildSession({ pendingMediaTypes: ['audio', 'video'] })]}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Waiting for permission')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Cancel recording for Recorder' }),
    ).toBeVisible();
  },
};

const stopAudioCapture = fn();
const stopVideoCapture = fn();

export const StopsEverySessionOfTheApplication: Story = {
  render: () => (
    <div role="list">
      <FrontComponentMediaSessionTooltipRow
        sessions={[
          buildSession({
            activeMediaTypes: ['audio'],
            onStop: stopAudioCapture,
          }),
          buildSession({
            id: 'recorder-video',
            activeMediaTypes: ['video'],
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
      canvas.getByRole('button', { name: 'Stop recording for Recorder' }),
    );

    await expect(stopAudioCapture).toHaveBeenCalledTimes(1);
    await expect(stopVideoCapture).toHaveBeenCalledTimes(1);
  },
};
