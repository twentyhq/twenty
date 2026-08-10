import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type CalendarEventCallRecordingCandidate } from '@/page-layout/widgets/calendar-event-call-recording/types/CalendarEventCallRecordingCandidate';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { CallRecordingStatus } from '~/generated/graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

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

const callRecording: CalendarEventCallRecordingCandidate = {
  __typename: 'CallRecording',
  id: 'call-recording-id',
  status: CallRecordingStatus.COMPLETED,
  transcript: [],
  summary: null,
  createdAt: '2026-01-01T00:00:00Z',
};

const transcriptEntries = [
  {
    speakerName: 'Ada Lovelace',
    startSeconds: 12,
    endSeconds: 21,
    text: 'Thanks for joining, let us walk through the quarterly numbers.',
    words: [],
  },
  {
    speakerName: 'Grace Hopper',
    startSeconds: 24,
    endSeconds: 40,
    text: 'Happy to. Pipeline grew twenty percent since the last call.',
    words: [],
  },
  {
    speakerName: undefined,
    startSeconds: undefined,
    endSeconds: undefined,
    text: 'Inaudible segment.',
    words: [],
  },
];

const meta: Meta<typeof CallRecordingTranscriptBody> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingTranscriptBody',
  component: CallRecordingTranscriptBody,
  decorators: [
    (Story) => {
      setTestObjectMetadataItemsInMetadataStore(
        jotaiStore,
        getTestEnrichedObjectMetadataItemsMock(),
      );
      jotaiStore.set(isMinimalMetadataReadyState.atom, true);
      jotaiStore.set(
        pageLayoutPersistedComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutWithTranscriptWidget,
      );
      jotaiStore.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutWithTranscriptWidget,
      );

      return (
        <div style={{ width: '500px', height: '360px', display: 'flex' }}>
          <PageLayoutTestWrapper store={jotaiStore}>
            <LayoutRenderingProvider
              value={{
                isInSidePanel: false,
                layoutType: PageLayoutType.RECORD_PAGE,
                targetRecordIdentifier: undefined,
              }}
            >
              <PageLayoutContentProvider
                value={{
                  tabId: CALL_RECORDING_TAB_ID,
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  presentation: 'stack',
                }}
              >
                <WidgetComponentInstanceContext.Provider
                  value={{ instanceId: TRANSCRIPT_WIDGET_ID }}
                >
                  <Story />
                </WidgetComponentInstanceContext.Provider>
              </PageLayoutContentProvider>
            </LayoutRenderingProvider>
          </PageLayoutTestWrapper>
        </div>
      );
    },
    ComponentDecorator,
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingTranscriptBody>;

export const Ready: Story = {
  args: {
    callRecordingState: {
      state: 'READY',
      entries: transcriptEntries,
      callRecording,
    },
  },
};

export const Loading: Story = {
  args: {
    callRecordingState: { state: 'LOADING' },
  },
};

export const Pending: Story = {
  args: {
    callRecordingState: { state: 'PENDING', callRecording },
  },
};

export const Failed: Story = {
  args: {
    callRecordingState: { state: 'FAILED', callRecording },
  },
};

export const NoRecording: Story = {
  args: {
    callRecordingState: { state: 'NO_RECORDING' },
  },
};

export const Unavailable: Story = {
  args: {
    callRecordingState: { state: 'UNAVAILABLE' },
  },
};

export const ForbiddenObject: Story = {
  args: {
    callRecordingState: {
      state: 'FORBIDDEN',
      restriction: { type: 'object', objectName: 'Call Recording' },
    },
  },
};

export const ForbiddenFields: Story = {
  args: {
    callRecordingState: {
      state: 'FORBIDDEN',
      restriction: { type: 'field', fieldNames: ['Transcript'] },
    },
  },
};

export const QueryError: Story = {
  args: {
    callRecordingState: {
      state: 'QUERY_ERROR',
      error: new Error('Failed to load call recordings'),
    },
  },
};
