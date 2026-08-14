import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import {
  HOST_API_TIMEOUT,
  INTERACTION_TIMEOUT,
} from '@/__stories__/shared/test-utils/timeouts';
import { type MediaSessionEventTransport } from '@/host/media/types/FrontComponentMediaSessionHost';

const TEST_STREAM_ID = 'stream-under-test';
const TEST_TRACK_ID = 'track-under-test';
const TEST_RECORDER_ID = 'recorder-under-test';
const FAKE_RECORDED_BYTES = 'fake-audio-bytes';

// A scripted session host: the worker side stays fully real (polyfills,
// bridge, thread), while the host side answers with fabricated devices so
// the story is deterministic without real hardware.
const createMockMediaSessionHost = () => {
  let transport: MediaSessionEventTransport | null = null;

  return {
    mediaStartStream: fn(async () => ({
      status: 'started' as const,
      streamId: TEST_STREAM_ID,
      tracks: [{ trackId: TEST_TRACK_ID, kind: 'audio' as const }],
    })),
    mediaStopStreamTrack: fn(async () => {}),
    mediaSetTrackEnabled: fn(async () => {}),
    mediaStartRecorder: fn(async () => ({
      status: 'started' as const,
      recorderId: TEST_RECORDER_ID,
      mimeType: 'audio/webm',
    })),
    mediaStopRecorder: fn(async () => {
      await transport?.pushMediaSessionEvents({
        events: [
          {
            type: 'recorder-data',
            recorderId: TEST_RECORDER_ID,
            data: new Blob([FAKE_RECORDED_BYTES]),
          },
          { type: 'recorder-stop', recorderId: TEST_RECORDER_ID },
        ],
      });
    }),
    mediaPauseRecorder: fn(async () => {}),
    mediaResumeRecorder: fn(async () => {}),
    mediaRequestRecorderData: fn(async () => {}),
    connectEventTransport: (nextTransport: MediaSessionEventTransport) => {
      transport = nextTransport;
    },
    disconnectEventTransport: () => {
      transport = null;
    },
    stopAllSessions: fn(),
    getRecorderCapabilities: () => ({ supportedMimeTypes: ['audio/webm'] }),
  };
};

const mockMediaSessionHost = createMockMediaSessionHost();

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/Media/MediaRecorderPolyfill',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

const baseStory = runFrontComponentStory({
  frontComponentBundleName: 'media-recorder-polyfill',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    const subject = await canvas.findByTestId('subject');

    await userEvent.click(subject);

    // The full loop ran: getUserMedia and MediaRecorder in the worker,
    // capture RPCs to the host, and the recorded Blob pushed back across
    // the bridge into standard dataavailable/stop events.
    expect(
      await canvas.findByText(
        `media:captured:${FAKE_RECORDED_BYTES.length}`,
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();

    await waitFor(
      () => {
        expect(mockMediaSessionHost.mediaStartStream).toHaveBeenCalledWith(
          expect.objectContaining({ mediaType: 'audio' }),
        );
        expect(mockMediaSessionHost.mediaStartRecorder).toHaveBeenCalledWith(
          expect.objectContaining({ streamId: TEST_STREAM_ID }),
        );
        expect(mockMediaSessionHost.mediaStopRecorder).toHaveBeenCalledWith(
          expect.objectContaining({ recorderId: TEST_RECORDER_ID }),
        );
        expect(mockMediaSessionHost.mediaStopStreamTrack).toHaveBeenCalledWith(
          expect.objectContaining({
            streamId: TEST_STREAM_ID,
            trackId: TEST_TRACK_ID,
          }),
        );
      },
      { timeout: HOST_API_TIMEOUT },
    );
  },
});

export const MediaRecorderPolyfill: Story = {
  ...baseStory,
  args: {
    ...baseStory.args,
    mediaSessionHost: mockMediaSessionHost,
  },
};
