import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getCallRecordingWidgetStoryDecorator } from '@/page-layout/widgets/calendar-event-call-recording/testing/getCallRecordingWidgetStoryDecorator';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { getCallRecordingVideoFileUrl } from '@/page-layout/widgets/calendar-event-call-recording/utils/getCallRecordingVideoFileUrl';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptHeaderDataEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataEffect';
import { CALL_RECORDING_TRANSCRIPT_CURRENT_SPOKEN_WORD_DATA_ATTRIBUTE } from '@/page-layout/widgets/call-recording-transcript/constants/CallRecordingTranscriptCurrentSpokenWordDataAttribute';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import {
  expect,
  fireEvent,
  fn,
  spyOn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import {
  isDefined,
  parseCallRecordingTranscriptEntries,
} from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { CallRecordingStatus } from '~/generated/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { MOCK_CALL_RECORDING_VIDEO_DATA_URI } from './mockCallRecordingVideo';

const TRANSCRIPT_WIDGET_ID = 'transcript-widget';
const CALL_RECORDING_TAB_ID = 'call-recording-tab';
const VIDEO_URL = MOCK_CALL_RECORDING_VIDEO_DATA_URI;

const transcriptWidget: PageLayoutWidget = {
  __typename: 'PageLayoutWidget',
  applicationId: '',
  isActive: true,
  isSystemSideEffect: false,
  universalIdentifier: '20202020-0000-0000-0000-000000000003',
  id: TRANSCRIPT_WIDGET_ID,
  pageLayoutTabId: CALL_RECORDING_TAB_ID,
  type: WidgetType.CALL_RECORDING_TRANSCRIPT,
  title: 'Transcript',
  objectMetadataId: null,
  gridPosition: {
    __typename: 'GridPosition',
    row: 0,
    column: 0,
    rowSpan: 4,
    columnSpan: 12,
  },
  configuration: {
    __typename: 'CallRecordingTranscriptConfiguration',
    configurationType: WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const pageLayoutWithTranscriptWidget: PageLayout = {
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Calendar Event Layout',
  type: PageLayoutType.RECORD_PAGE,
  applicationId: '',
  isSystemSideEffect: false,
  objectMetadataId: null,
  universalIdentifier: '20202020-0000-0000-0000-000000000001',
  tabs: [
    {
      __typename: 'PageLayoutTab',
      isActive: true,
      isSystemSideEffect: false,
      applicationId: '',
      universalIdentifier: '20202020-0000-0000-0000-000000000002',
      id: CALL_RECORDING_TAB_ID,
      title: 'Call Recording',
      position: 0,
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      widgets: [transcriptWidget],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const completedCallRecording: CalendarEventCallRecordingCandidate = {
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: [],
  summary: null,
  video: null,
  createdAt: '2026-01-01T00:00:00Z',
};

const pendingCallRecording: CalendarEventCallRecordingCandidate = {
  ...completedCallRecording,
  status: CallRecordingStatus.PROCESSING,
  transcript: { status: 'PENDING' },
};

const failedCallRecording: CalendarEventCallRecordingCandidate = {
  ...completedCallRecording,
  status: CallRecordingStatus.FAILED,
  transcript: null,
};

const makeMockTranscriptEntry = ({
  speakerName,
  text,
  startSeconds,
  endSeconds,
}: {
  speakerName: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
}) => {
  const wordTexts = text.split(' ');
  const wordDurationSeconds = (endSeconds - startSeconds) / wordTexts.length;

  return {
    participant: { name: speakerName },
    words: wordTexts.map((wordText, wordIndex) => ({
      text: wordText,
      start_timestamp: {
        relative: startSeconds + wordIndex * wordDurationSeconds,
      },
      end_timestamp: {
        relative: startSeconds + (wordIndex + 1) * wordDurationSeconds,
      },
    })),
  };
};

const setVideoCurrentTime = ({
  videoElement,
  currentTimeSeconds,
}: {
  videoElement: HTMLVideoElement;
  currentTimeSeconds: number;
}) => {
  videoElement.currentTime = currentTimeSeconds;
  fireEvent.timeUpdate(videoElement);
};

// Seeking before metadata is loaded would be reverted by the player's
// first-frame fragment seek once metadata arrives.
const waitForVideoMetadata = async (videoElement: HTMLVideoElement) => {
  await waitFor(() =>
    expect(videoElement.readyState).toBeGreaterThanOrEqual(
      HTMLMediaElement.HAVE_METADATA,
    ),
  );
};

const rawTranscript = [
  makeMockTranscriptEntry({
    speakerName: 'Ada Lovelace',
    text: "Welcome everyone, let's start with a quick project update.",
    startSeconds: 1,
    endSeconds: 5,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Grace Hopper',
    text: 'The first milestone is complete and ready for review.',
    startSeconds: 6,
    endSeconds: 10,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Alan Turing',
    text: 'I tested the playback controls across several browsers.',
    startSeconds: 11,
    endSeconds: 15,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Ada Lovelace',
    text: 'Great, did seeking keep the transcript synchronized?',
    startSeconds: 16,
    endSeconds: 20,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Alan Turing',
    text: 'Yes, the active entry followed every position change.',
    startSeconds: 21,
    endSeconds: 25,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Grace Hopper',
    text: 'Word highlighting stayed smooth during normal playback.',
    startSeconds: 26,
    endSeconds: 30,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Ada Lovelace',
    text: 'How does the player behave after a loading error?',
    startSeconds: 31,
    endSeconds: 35,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Grace Hopper',
    text: 'Retrying refreshes the recording and restores the player.',
    startSeconds: 36,
    endSeconds: 40,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Alan Turing',
    text: 'The header actions are available for every recording.',
    startSeconds: 41,
    endSeconds: 45,
  }),
  makeMockTranscriptEntry({
    speakerName: 'Ada Lovelace',
    text: "Perfect, let's gather final feedback and wrap up.",
    startSeconds: 46,
    endSeconds: 51,
  }),
];

const readableCallRecording: CalendarEventCallRecordingCandidate = {
  ...completedCallRecording,
  transcript: rawTranscript,
};

const recordedCallRecording: CalendarEventCallRecordingCandidate = {
  ...readableCallRecording,
  video: [
    {
      fileId: 'video-file-id',
      label: 'recording.webm',
      extension: 'webm',
      url: VIDEO_URL,
    },
  ],
};

const unplayableRecordedCallRecording: CalendarEventCallRecordingCandidate = {
  ...recordedCallRecording,
  video: [
    {
      fileId: 'unplayable-video-file-id',
      label: 'unplayable-recording.mp4',
      extension: 'mp4',
      url: 'data:video/mp4,not-a-video',
    },
  ],
};

type CallRecordingTranscriptBodyStoryProps = Omit<
  ComponentProps<typeof CallRecordingTranscriptBody>,
  'transcriptEntries' | 'videoFileUrl'
>;

const CallRecordingTranscriptBodyStory = (
  args: CallRecordingTranscriptBodyStoryProps,
) => {
  const canExposeCallRecordingHeaderData =
    !args.loading && !isDefined(args.error) && !isDefined(args.restriction);

  const callRecordingForHeader = canExposeCallRecordingHeaderData
    ? args.callRecording
    : undefined;

  const transcriptEntries = parseCallRecordingTranscriptEntries(
    callRecordingForHeader?.transcript,
  );
  const videoFileUrl = getCallRecordingVideoFileUrl(callRecordingForHeader);

  return (
    <>
      <WidgetHeaderCountEffect
        count={
          canExposeCallRecordingHeaderData && isDefined(args.callRecording)
            ? 1
            : 0
        }
      />
      <CallRecordingTranscriptHeaderDataEffect
        transcriptEntries={transcriptEntries}
        videoFileUrl={videoFileUrl}
      />
      <CallRecordingTranscriptBody
        {...args}
        transcriptEntries={transcriptEntries}
        videoFileUrl={videoFileUrl}
      />
    </>
  );
};

const PlaybackErrorRecoveryStory = (
  args: CallRecordingTranscriptBodyStoryProps,
) => {
  const [callRecording, setCallRecording] = useState(args.callRecording);

  const refetchCallRecording = async () => {
    await args.refetchCallRecording();
    setCallRecording(recordedCallRecording);
  };

  return (
    <CallRecordingTranscriptBodyStory
      {...args}
      callRecording={callRecording}
      refetchCallRecording={refetchCallRecording}
    />
  );
};

const meta: Meta<typeof CallRecordingTranscriptBodyStory> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingTranscriptBody',
  component: CallRecordingTranscriptBodyStory,
  decorators: [
    getCallRecordingWidgetStoryDecorator({
      pageLayout: pageLayoutWithTranscriptWidget,
      tabId: CALL_RECORDING_TAB_ID,
      widgetId: TRANSCRIPT_WIDGET_ID,
    }),
    MemoryRouterDecorator,
    SnackBarDecorator,
    ComponentDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
  render: CallRecordingTranscriptBodyStory,
  args: {
    refetchCallRecording: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingTranscriptBodyStory>;

export const Ready: Story = {
  args: {
    callRecording: readableCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findAllByText('Ada Lovelace')).toHaveLength(4);
    expect(await canvas.findAllByText('Alan Turing')).toHaveLength(3);

    const transcriptRegion = canvas.getByRole('region', {
      name: 'Transcript',
    });

    fireEvent.wheel(transcriptRegion);

    expect(
      canvas.queryByRole('button', { name: 'Jump to current' }),
    ).not.toBeInTheDocument();
  },
};

export const WithVideo: Story = {
  args: {
    callRecording: recordedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const transcriptRegion = await canvas.findByRole('region', {
      name: 'Transcript',
    });
    const videoElement = canvasElement.querySelector('video');

    if (!isDefined(videoElement)) {
      throw new Error('Video player was not rendered');
    }

    expect(transcriptRegion).toBeVisible();
    expect(videoElement.currentTime).toBeLessThan(1);
    expect(
      canvasElement.querySelector('[aria-current="true"]'),
    ).not.toBeInTheDocument();

    const copyTranscriptButton = await canvas.findByRole('button', {
      name: 'Copy transcript',
    });
    const copyVideoLinkButton = canvas.getByRole('button', {
      name: 'Copy video download link',
    });
    const writeText = spyOn(
      navigator.clipboard,
      'writeText',
    ).mockResolvedValue();

    await userEvent.click(copyTranscriptButton);

    expect(writeText).toHaveBeenLastCalledWith(
      expect.stringContaining(
        "Ada Lovelace (0:01)\nWelcome everyone, let's start with a quick project update.",
      ),
    );

    await userEvent.click(copyVideoLinkButton);

    expect(writeText).toHaveBeenLastCalledWith(VIDEO_URL);

    writeText.mockRestore();

    const seeAllLink = canvas.getByRole('link', {
      name: 'See all call recordings linked to this calendar event',
    });

    expect(seeAllLink).toHaveAttribute(
      'href',
      expect.stringContaining('calendar-event-id'),
    );

    await waitForVideoMetadata(videoElement);

    setVideoCurrentTime({ videoElement, currentTimeSeconds: 1.5 });

    await waitFor(() =>
      expect(
        canvasElement.querySelector('[aria-current="true"]'),
      ).toHaveTextContent("Welcome everyone, let's start"),
    );

    setVideoCurrentTime({ videoElement, currentTimeSeconds: 5.5 });

    await waitFor(() =>
      expect(
        canvasElement.querySelector('[aria-current="true"]'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const PlaybackError: Story = {
  args: {
    callRecording: unplayableRecordedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
    refetchCallRecording: fn(async () => {}),
  },
  render: PlaybackErrorRecoveryStory,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Playback failed');
    await userEvent.click(canvas.getByRole('button', { name: /^Retry/ }));

    expect(args.refetchCallRecording).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(canvasElement.querySelector('video')).toHaveAttribute(
        'src',
        `${VIDEO_URL}#t=0.001`,
      ),
    );
  },
};

export const WithVideoInteractions: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    callRecording: recordedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findAllByText('Ada Lovelace')).toHaveLength(4);

    const transcriptRegion = await canvas.findByRole('region', {
      name: 'Transcript',
    });
    const videoElement = canvasElement.querySelector('video');

    if (!isDefined(videoElement)) {
      throw new Error('Video player was not rendered');
    }

    await waitForVideoMetadata(videoElement);

    setVideoCurrentTime({ videoElement, currentTimeSeconds: 48 });

    await waitFor(() => {
      const activeEntry = canvasElement.querySelector('[aria-current="true"]');

      expect(activeEntry).toHaveTextContent(
        "Perfect, let's gather final feedback and wrap up.",
      );
      expect(transcriptRegion.scrollTop).toBeGreaterThan(0);
    });

    fireEvent.wheel(transcriptRegion, { deltaY: -100 });

    expect(
      await canvas.findByRole('button', { name: 'Jump to current' }),
    ).toBeVisible();

    videoElement.currentTime = 22;
    fireEvent.seeking(videoElement);
    fireEvent.seeked(videoElement);
    fireEvent.timeUpdate(videoElement);

    await waitFor(() => {
      const activeEntry = canvasElement.querySelector('[aria-current="true"]');
      const currentSpokenWordRectangle = canvasElement
        .querySelector(
          `[${CALL_RECORDING_TRANSCRIPT_CURRENT_SPOKEN_WORD_DATA_ATTRIBUTE}]`,
        )
        ?.getBoundingClientRect();
      const transcriptRegionRectangle =
        transcriptRegion.getBoundingClientRect();

      expect(activeEntry).toHaveTextContent(
        'Yes, the active entry followed every position change.',
      );
      expect(
        canvas.queryByRole('button', { name: 'Jump to current' }),
      ).not.toBeInTheDocument();
      expect(currentSpokenWordRectangle?.top).toBeGreaterThanOrEqual(
        transcriptRegionRectangle.top,
      );
      expect(currentSpokenWordRectangle?.bottom).toBeLessThanOrEqual(
        transcriptRegionRectangle.bottom,
      );
    });

    const transcriptEntryButton = canvas.getByRole('button', {
      name: 'Seek recording to 0:06',
    });

    await userEvent.click(transcriptEntryButton);
    fireEvent.timeUpdate(videoElement);

    await waitFor(() => {
      expect(canvasElement.querySelector('video')).toBe(videoElement);
      expect(videoElement.currentTime).toBeCloseTo(6);
      expect(
        canvasElement.querySelector('[aria-current="true"]'),
      ).toHaveTextContent(
        'The first milestone is complete and ready for review.',
      );
    });
  },
};

export const Loading: Story = {
  args: {
    callRecording: undefined,
    loading: true,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.react-loading-skeleton'),
      ).toBeVisible();
    });
  },
};

export const Pending: Story = {
  args: {
    callRecording: pendingCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Preparing Transcript');
  },
};

export const Failed: Story = {
  args: {
    callRecording: failedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Transcript Failed');
  },
};

export const NoTranscript: Story = {
  args: {
    callRecording: completedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('No Transcript');
  },
};

export const NoRecording: Story = {
  args: {
    callRecording: undefined,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('No Call Recording');
  },
};

export const Forbidden: Story = {
  args: {
    callRecording: recordedCallRecording,
    loading: false,
    error: undefined,
    restriction: { type: 'field', fieldNames: ['Transcript'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not shared');
    expect(
      canvas.queryByRole('button', { name: 'Copy transcript' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Copy video download link' }),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('link', {
        name: 'See all call recordings linked to this calendar event',
      }),
    ).not.toBeInTheDocument();
  },
};

export const QueryError: Story = {
  args: {
    callRecording: undefined,
    loading: false,
    error: new Error('Failed to load call recordings'),
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Error');
  },
};
