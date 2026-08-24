import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getCallRecordingWidgetStoryDecorator } from '@/page-layout/widgets/calendar-event-call-recording/testing/getCallRecordingWidgetStoryDecorator';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptHeaderDataEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataEffect';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState, type ComponentProps } from 'react';
import { expect, fn, spyOn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { CallRecordingStatus } from '~/generated/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const TRANSCRIPT_WIDGET_ID = 'transcript-widget';
const CALL_RECORDING_TAB_ID = 'call-recording-tab';

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

const rawTranscript = [
  {
    participant: { name: 'Ada Lovelace' },
    words: [
      {
        text: 'Thanks for joining, let us walk through the quarterly numbers.',
        start_timestamp: { relative: 12 },
        end_timestamp: { relative: 21 },
      },
    ],
  },
  {
    participant: { name: 'Grace Hopper' },
    words: [
      {
        text: 'Happy to. Pipeline grew twenty percent since the last call.',
        start_timestamp: { relative: 24 },
        end_timestamp: { relative: 40 },
      },
    ],
  },
  {
    participant: {},
    words: [{ text: 'Inaudible segment.' }],
  },
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
      label: 'recording.mp4',
      extension: 'mp4',
      url: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
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

type CallRecordingTranscriptBodyStoryProps = ComponentProps<
  typeof CallRecordingTranscriptBody
>;

const CallRecordingTranscriptBodyStory = (
  args: CallRecordingTranscriptBodyStoryProps,
) => (
  <>
    <WidgetHeaderCountEffect count={isDefined(args.callRecording) ? 1 : 0} />
    <CallRecordingTranscriptHeaderDataEffect
      callRecording={args.callRecording}
    />
    <CallRecordingTranscriptBody {...args} />
  </>
);

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

const meta: Meta<typeof CallRecordingTranscriptBody> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingTranscriptBody',
  component: CallRecordingTranscriptBody,
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
  render: (args) => <CallRecordingTranscriptBodyStory {...args} />,
  args: {
    refetchCallRecording: async () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingTranscriptBody>;

export const Ready: Story = {
  args: {
    callRecording: readableCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Ada Lovelace');
    await canvas.findByText(
      'Happy to. Pipeline grew twenty percent since the last call.',
    );
    await canvas.findByText('Inaudible segment.');
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

    expect(await canvas.findByText('Transcript')).toBeVisible();
    expect(canvasElement.querySelector('video')).not.toBeNull();
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
      'Ada Lovelace (0:12)\nThanks for joining, let us walk through the quarterly numbers.\n\nGrace Hopper (0:24)\nHappy to. Pipeline grew twenty percent since the last call.\n\nUnknown speaker\nInaudible segment.',
    );

    await userEvent.click(copyVideoLinkButton);

    expect(writeText).toHaveBeenLastCalledWith(
      'https://media.w3.org/2010/05/sintel/trailer.mp4',
    );

    writeText.mockRestore();

    const seeAllLink = canvas.getByRole('link', {
      name: 'See all call recordings linked to this calendar event',
    });

    expect(seeAllLink).toHaveAttribute(
      'href',
      expect.stringContaining('calendar-event-id'),
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
  render: (args) => <PlaybackErrorRecoveryStory {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Playback failed');
    await userEvent.click(canvas.getByRole('button', { name: /^Retry/ }));

    expect(args.refetchCallRecording).toHaveBeenCalledTimes(1);

    await waitFor(() =>
      expect(canvasElement.querySelector('video')).toHaveAttribute(
        'src',
        'https://media.w3.org/2010/05/sintel/trailer.mp4#t=0.001',
      ),
    );
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
    callRecording: undefined,
    loading: false,
    error: undefined,
    restriction: { type: 'field', fieldNames: ['Transcript'] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not shared');
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
