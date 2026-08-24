import { isMinimalMetadataReadyState } from '@/metadata-store/states/isMinimalMetadataReadyState';
import { PageLayoutContentProvider } from '@/page-layout/contexts/PageLayoutContentContext';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { WidgetCard } from '@/page-layout/widgets/widget-card/components/WidgetCard';
import { WidgetCardContent } from '@/page-layout/widgets/widget-card/components/WidgetCardContent';
import { WidgetCardHeader } from '@/page-layout/widgets/widget-card/components/WidgetCardHeader';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { StyledWidgetScrollContainer } from '@/ui/layout/components/WidgetContentContainer';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Decorator } from '@storybook/react-vite';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
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

    const calendarEventObjectMetadataItem = getMockObjectMetadataItemOrThrow(
      CoreObjectNameSingular.CalendarEvent,
    );

    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
      ...getTestEnrichedObjectMetadataItemsMock(),
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
      <div style={{ display: 'flex', height: 360, width: 500 }}>
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
              <WidgetComponentInstanceContext.Provider
                value={{ instanceId: widget.id }}
              >
                <WidgetCard
                  variant="flush"
                  isEditable={false}
                  isEditing={false}
                  isDragging={false}
                  isResizing={false}
                >
                  <WidgetCardHeader
                    className="widget-card-header"
                    widgetId={widget.id}
                    variant="flush"
                    isInEditMode={false}
                    hasAccess={true}
                    isResizing={false}
                    title={widget.title}
                  />
                  <WidgetCardContent
                    variant="flush"
                    hasHeader={true}
                    isEditable={false}
                  >
                    <StyledWidgetScrollContainer>
                      <Story />
                    </StyledWidgetScrollContainer>
                  </WidgetCardContent>
                </WidgetCard>
              </WidgetComponentInstanceContext.Provider>
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      </div>
    );
  };
