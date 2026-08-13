import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getCallRecordingWidgetStoryDecorator } from '@/page-layout/widgets/calendar-event-call-recording/testing/getCallRecordingWidgetStoryDecorator';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { CallRecordingStatus } from '~/generated/graphql';

const SUMMARY_WIDGET_ID = 'summary-widget';
const SUMMARY_TAB_ID = 'summary-tab';

const summaryWidget: PageLayoutWidget = {
  __typename: 'PageLayoutWidget',
  applicationId: '',
  isActive: true,
  isSystemSideEffect: false,
  universalIdentifier: '20202020-0000-0000-0000-000000000003',
  id: SUMMARY_WIDGET_ID,
  pageLayoutTabId: SUMMARY_TAB_ID,
  type: WidgetType.CALL_RECORDING_SUMMARY,
  title: 'Summary',
  objectMetadataId: null,
  gridPosition: {
    __typename: 'GridPosition',
    row: 0,
    column: 0,
    rowSpan: 4,
    columnSpan: 12,
  },
  configuration: {
    __typename: 'CallRecordingSummaryConfiguration',
    configurationType: WidgetConfigurationType.CALL_RECORDING_SUMMARY,
  },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const pageLayoutWithSummaryWidget: PageLayout = {
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
      id: SUMMARY_TAB_ID,
      title: 'Summary',
      position: 0,
      pageLayoutId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      widgets: [summaryWidget],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      deletedAt: null,
    },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
};

const summaryMarkdown = [
  '# Quarterly review call',
  '',
  '## Key points',
  '',
  '- Pipeline grew twenty percent since the last call.',
  '- Two enterprise deals slipped to next quarter.',
  '',
  '## Action items',
  '',
  '1. Send the updated forecast to the leadership team.',
  '2. Schedule a follow-up with the procurement contact.',
].join('\n');

const summarizedCallRecording: CalendarEventCallRecordingCandidate = {
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: [],
  summary: { markdown: summaryMarkdown },
  video: null,
  createdAt: '2026-01-01T00:00:00Z',
};

const unsummarizedCallRecording: CalendarEventCallRecordingCandidate = {
  ...summarizedCallRecording,
  summary: null,
};

const pendingCallRecording: CalendarEventCallRecordingCandidate = {
  ...unsummarizedCallRecording,
  status: CallRecordingStatus.PROCESSING,
  transcript: { status: 'PENDING' },
};

const failedCallRecording: CalendarEventCallRecordingCandidate = {
  ...unsummarizedCallRecording,
  status: CallRecordingStatus.FAILED,
  transcript: null,
};

const meta: Meta<typeof CallRecordingSummaryBody> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingSummaryBody',
  component: CallRecordingSummaryBody,
  decorators: [
    getCallRecordingWidgetStoryDecorator({
      pageLayout: pageLayoutWithSummaryWidget,
      tabId: SUMMARY_TAB_ID,
      widgetId: SUMMARY_WIDGET_ID,
    }),
    ComponentDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingSummaryBody>;

export const Ready: Story = {
  args: {
    callRecording: summarizedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Quarterly review call', undefined, {
      timeout: 5000,
    });
  },
};

export const ReadyWhileRecordingIsPending: Story = {
  args: {
    callRecording: {
      ...pendingCallRecording,
      summary: { markdown: summaryMarkdown },
    },
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Quarterly review call', undefined, {
      timeout: 5000,
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

export const NoSummary: Story = {
  args: {
    callRecording: unsummarizedCallRecording,
    loading: false,
    error: undefined,
    restriction: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByText('No Summary');
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

    await canvas.findByText('Processing Recording');
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

    await canvas.findByText('Processing Failed');
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
    restriction: { type: 'field', fieldNames: ['Summary'] },
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
