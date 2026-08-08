import { renderHook } from '@testing-library/react';
import { type createStore } from 'jotai';
import { act } from 'react';
import { ContextStorePageType, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useOpenRecordsInSidePanel } from '@/side-panel/hooks/useOpenRecordsInSidePanel';
import { viewableRecordsViewIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsViewIdComponentState';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const navigateSidePanelMenuMock = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: navigateSidePanelMenuMock,
    openSidePanelMenu: jest.fn(),
    closeSidePanelMenu: jest.fn(),
    toggleSidePanelMenu: jest.fn(),
  }),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const INDEX_VIEW_ID = '11111111-1111-4111-8111-111111111111';
const KANBAN_VIEW_ID = '22222222-2222-4222-8222-222222222222';
const WIDGET_VIEW_ID = '33333333-3333-4333-8333-333333333333';
const LIST_VIEW_ID = '44444444-4444-4444-8444-444444444444';

const buildCompanyView = (view: Partial<ViewWithRelations>) =>
  ({
    name: 'All Companies',
    icon: 'IconBuildingSkyscraper',
    objectMetadataId: companyObjectMetadataItem.id,
    type: ViewType.TABLE,
    key: null,
    position: 0,
    isActive: true,
    ...view,
  }) as ViewWithRelations;

const indexView = buildCompanyView({
  id: INDEX_VIEW_ID,
  name: 'All Companies',
  key: ViewKey.INDEX,
  position: 1,
});

const kanbanView = buildCompanyView({
  id: KANBAN_VIEW_ID,
  name: 'Companies by Stage',
  type: ViewType.KANBAN,
  position: 2,
});

const listView = buildCompanyView({
  id: LIST_VIEW_ID,
  name: 'Companies list',
  type: ViewType.LIST,
  position: 3,
});

const buildWidgetView = (type: ViewType) =>
  buildCompanyView({
    id: WIDGET_VIEW_ID,
    name: 'Dashboard widget view',
    type,
    position: 0,
  });

const widgetView = buildWidgetView(ViewType.KANBAN_WIDGET);

const renderOpenRecordsInSidePanel = (views: ViewWithRelations[]) => {
  let store: ReturnType<typeof createStore> | undefined;

  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;
      setTestViewsInMetadataStore(initializedStore, views);
    },
  });

  const { result } = renderHook(() => useOpenRecordsInSidePanel(), {
    wrapper: Wrapper,
  });

  if (!isDefined(store)) {
    throw new Error('Jotai store was not initialized');
  }

  return { result, store };
};

const getNavigatedPageId = () =>
  navigateSidePanelMenuMock.mock.calls[0][0].pageId as string;

describe('useOpenRecordsInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open the requested view when the view id is user-facing', () => {
    const { result, store } = renderOpenRecordsInSidePanel([
      indexView,
      kanbanView,
    ]);

    act(() => {
      result.current.openRecordsInSidePanel({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
        viewId: KANBAN_VIEW_ID,
      });
    });

    expect(navigateSidePanelMenuMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.ViewRecords,
        pageTitle: 'Companies by Stage',
      }),
    );

    const pageId = getNavigatedPageId();

    expect(
      store.get(
        viewableRecordsViewIdComponentState.atomFamily({
          instanceId: pageId,
        }),
      ),
    ).toBe(KANBAN_VIEW_ID);
    expect(
      store.get(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: pageId,
        }),
      ),
    ).toBe(ContextStoreViewType.Kanban);
  });

  it('should fall back to the index view when no view id is given', () => {
    const { result, store } = renderOpenRecordsInSidePanel([
      kanbanView,
      indexView,
    ]);

    act(() => {
      result.current.openRecordsInSidePanel({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
      });
    });

    const pageId = getNavigatedPageId();

    expect(
      store.get(
        viewableRecordsViewIdComponentState.atomFamily({
          instanceId: pageId,
        }),
      ),
    ).toBe(INDEX_VIEW_ID);
    expect(
      store.get(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: pageId,
        }),
      ),
    ).toBe(ContextStoreViewType.Table);
  });

  it('should fall back to the first view by position when the object has no index view', () => {
    const { result, store } = renderOpenRecordsInSidePanel([
      buildCompanyView({
        id: KANBAN_VIEW_ID,
        type: ViewType.KANBAN,
        position: 5,
      }),
      buildCompanyView({ id: INDEX_VIEW_ID, position: 2 }),
    ]);

    act(() => {
      result.current.openRecordsInSidePanel({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
      });
    });

    expect(
      store.get(
        viewableRecordsViewIdComponentState.atomFamily({
          instanceId: getNavigatedPageId(),
        }),
      ),
    ).toBe(INDEX_VIEW_ID);
  });

  it.each([ViewType.KANBAN_WIDGET, ViewType.LIST_WIDGET])(
    'should fall back to the index view when the view id points at a %s view',
    (widgetViewType) => {
      const { result, store } = renderOpenRecordsInSidePanel([
        buildWidgetView(widgetViewType),
        indexView,
      ]);

      act(() => {
        result.current.openRecordsInSidePanel({
          objectNameSingular: companyObjectMetadataItem.nameSingular,
          viewId: WIDGET_VIEW_ID,
        });
      });

      expect(
        store.get(
          viewableRecordsViewIdComponentState.atomFamily({
            instanceId: getNavigatedPageId(),
          }),
        ),
      ).toBe(INDEX_VIEW_ID);
    },
  );

  it('should open a list view without falling back to the index view', () => {
    const { result, store } = renderOpenRecordsInSidePanel([
      listView,
      indexView,
    ]);

    act(() => {
      result.current.openRecordsInSidePanel({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
        viewId: LIST_VIEW_ID,
      });
    });

    expect(
      store.get(
        viewableRecordsViewIdComponentState.atomFamily({
          instanceId: getNavigatedPageId(),
        }),
      ),
    ).toBe(LIST_VIEW_ID);
  });

  it('should throw when the object has no user-facing view', () => {
    const { result } = renderOpenRecordsInSidePanel([widgetView]);

    expect(() =>
      result.current.openRecordsInSidePanel({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
      }),
    ).toThrow('No view found for object company');

    expect(navigateSidePanelMenuMock).not.toHaveBeenCalled();
  });

  it('should publish the index page type as the artifact browsing context', () => {
    const { result, store } = renderOpenRecordsInSidePanel([indexView]);

    act(() => {
      result.current.openRecordsInSidePanel({
        objectNameSingular: companyObjectMetadataItem.nameSingular,
      });
    });

    expect(
      store.get(
        contextStoreCurrentPageTypeComponentState.atomFamily({
          instanceId: getNavigatedPageId(),
        }),
      ),
    ).toBe(ContextStorePageType.Index);
  });
});
