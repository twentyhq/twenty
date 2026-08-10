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
import { CallRecordingSummaryWidget } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryWidget';
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
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const SUMMARY_WIDGET_ID = 'summary-widget';
const SUMMARY_TAB_ID = 'summary-tab';

const summaryWidget: PageLayoutWidget = {
  __typename: 'PageLayoutWidget',
  applicationId: '',
  isActive: true,
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
  objectMetadataId: null,
  universalIdentifier: '20202020-0000-0000-0000-000000000001',
  tabs: [
    {
      __typename: 'PageLayoutTab',
      isActive: true,
      applicationId: '',
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

const meta: Meta<typeof CallRecordingSummaryWidget> = {
  title: 'Modules/PageLayout/Widgets/CallRecordingSummaryWidget',
  component: CallRecordingSummaryWidget,
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
        pageLayoutWithSummaryWidget,
      );
      jotaiStore.set(
        pageLayoutDraftComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
        pageLayoutWithSummaryWidget,
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
                  tabId: SUMMARY_TAB_ID,
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  presentation: 'stack',
                }}
              >
                <WidgetComponentInstanceContext.Provider
                  value={{ instanceId: SUMMARY_WIDGET_ID }}
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
    docs: {
      description: {
        component:
          'The test workspace metadata has no callRecording object, so the widget renders its unavailable guard state.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CallRecordingSummaryWidget>;

export const WithoutCallRecordingObjectMetadata: Story = {};
