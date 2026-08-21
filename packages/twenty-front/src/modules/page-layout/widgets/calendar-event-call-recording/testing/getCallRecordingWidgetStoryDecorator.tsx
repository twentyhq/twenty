import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { WidgetCardShell } from '@/page-layout/widgets/components/WidgetCardShell';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Decorator } from '@storybook/react-vite';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

export const getCallRecordingWidgetStoryDecorator =
  ({
    pageLayout,
    tabId,
    widgetId,
  }: {
    pageLayout: PageLayout;
    tabId: string;
    widgetId: string;
  }): Decorator =>
  (Story) => {
    const widget = pageLayout.tabs
      .flatMap((tab) => tab.widgets)
      .find((pageLayoutWidget) => pageLayoutWidget.id === widgetId);

    if (!isDefined(widget)) {
      throw new Error(`Widget ${widgetId} was not found in the page layout`);
    }

    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
    const calendarEventObjectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) =>
        nameSingular === CoreObjectNameSingular.CalendarEvent,
    );

    if (!isDefined(calendarEventObjectMetadataItem)) {
      throw new Error('Calendar event metadata was not found');
    }

    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
      ...objectMetadataItems,
      {
        ...calendarEventObjectMetadataItem,
        id: 'call-recording-object-metadata-id',
        nameSingular: CoreObjectNameSingular.CallRecording,
        namePlural: 'callRecordings',
        labelSingular: 'Call Recording',
        labelPlural: 'Call Recordings',
        fields: [],
      },
    ]);
    jotaiStore.set(isMinimalMetadataReadyState.atom, true);
    jotaiStore.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayout,
    );
    jotaiStore.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      pageLayout,
    );

    return (
      <div style={{ display: 'flex', width: 500 }}>
        <PageLayoutTestWrapper store={jotaiStore}>
          <LayoutRenderingProvider
            value={{
              isInSidePanel: false,
              layoutType: PageLayoutType.RECORD_PAGE,
              targetRecordIdentifier: {
                id: 'calendar-event-id',
                targetObjectNameSingular: CoreObjectNameSingular.CalendarEvent,
              },
            }}
          >
            <PageLayoutContentProvider
              value={{
                tabId,
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                presentation: 'stack',
              }}
            >
              <WidgetCardShell
                widget={widget}
                variant="record-page"
                isEditable={false}
                isEditing={false}
                isDragging={false}
                isResizing={false}
                isLastWidget={true}
                showHeader={true}
                hasAccess={true}
                restriction={{ type: null }}
                isInVerticalListTab={true}
                isMobile={false}
                isReorderEnabled={true}
                isDeletingWidgetEnabled={true}
                onRemove={() => {}}
              >
                <Story />
              </WidgetCardShell>
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      </div>
    );
  };
