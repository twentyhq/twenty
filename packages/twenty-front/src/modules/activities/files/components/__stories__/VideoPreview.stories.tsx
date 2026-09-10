import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, http } from 'msw';
import { expect, fireEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { VideoPreview } from '@/activities/files/components/VideoPreview';

const VIDEO_URL = '/storybook/product-demo.mp4';

const getVideo = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('video');

const meta: Meta<typeof VideoPreview> = {
  title: 'Modules/Activities/Files/VideoPreview',
  component: VideoPreview,
  decorators: [ComponentDecorator],
  args: {
    videoName: 'Product demo.mp4',
    videoUrl: VIDEO_URL,
  },
  parameters: {
    container: { height: 400, width: 600 },
    // The request never resolves, so the video only fails when a story makes it fail.
    msw: { handlers: [http.get(VIDEO_URL, () => delay('infinite'))] },
  },
};

export default meta;

type Story = StoryObj<typeof VideoPreview>;

export const Player: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(getVideo(canvasElement)).not.toBeNull();
    expect(canvas.queryByText('Preview Not Available')).toBeNull();
  },
};

export const LoadFailure: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    fireEvent.error(getVideo(canvasElement) as HTMLVideoElement);

    expect(await canvas.findByText('Preview Not Available')).toBeVisible();
    expect(getVideo(canvasElement)).toBeNull();
    expect(canvas.getByRole('button', { name: /Download File/ })).toBeVisible();
  },
};
