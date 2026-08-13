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
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Decorator } from '@storybook/react-vite';
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
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      getTestEnrichedObjectMetadataItemsMock(),
    );
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
                tabId,
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                presentation: 'stack',
              }}
            >
              <WidgetComponentInstanceContext.Provider
                value={{ instanceId: widgetId }}
              >
                <Story />
              </WidgetComponentInstanceContext.Provider>
            </PageLayoutContentProvider>
          </LayoutRenderingProvider>
        </PageLayoutTestWrapper>
      </div>
    );
  };
