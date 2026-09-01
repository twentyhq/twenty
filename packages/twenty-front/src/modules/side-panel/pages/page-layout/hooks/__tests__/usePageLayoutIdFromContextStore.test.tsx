import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconTable } from 'twenty-ui/icon';

const DASHBOARD_ID = 'dashboard-id';
const DASHBOARD_PAGE_LAYOUT_ID = 'dashboard-page-layout-id';
const DASHBOARD_OBJECT_METADATA_ID = 'dashboard-object-metadata-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';

jest.mock('@/object-metadata/hooks/useObjectMetadataItemById');

const mockUseObjectMetadataItemById =
  useObjectMetadataItemById as jest.MockedFunction<
    typeof useObjectMetadataItemById
  >;

describe('usePageLayoutIdFromContextStore', () => {
  it('keeps the page layout context captured by the side panel during a main route transition', () => {
    const store = createStore();

    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      COMPANY_OBJECT_METADATA_ID,
    );
    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      { mode: 'selection', selectedRecordIds: [] },
    );
    store.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.DashboardRecordTableSettings,
        pageTitle: 'Companies',
        pageIcon: IconTable,
        pageId: 'side-panel-page-id',
        pageLayoutContext: {
          pageLayoutId: DASHBOARD_PAGE_LAYOUT_ID,
          recordId: DASHBOARD_ID,
          objectMetadataItemId: DASHBOARD_OBJECT_METADATA_ID,
          objectNameSingular: 'dashboard',
        },
      },
    ]);

    mockUseObjectMetadataItemById.mockReturnValue({
      objectMetadataItem: {
        id: DASHBOARD_OBJECT_METADATA_ID,
        nameSingular: 'dashboard',
      },
    } as ReturnType<typeof useObjectMetadataItemById>);

    const { result } = renderHook(() => usePageLayoutIdFromContextStore(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>
          <ContextStoreComponentInstanceContext.Provider
            value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
          >
            <WorkspaceSurfaceContext.Provider
              value={{
                type: 'side-panel',
                instanceId: 'side-panel-page-id',
                ownsRouteLocation: false,
                headerTitlePortal: null,
                headerActionsPortal: null,
              }}
            >
              {children}
            </WorkspaceSurfaceContext.Provider>
          </ContextStoreComponentInstanceContext.Provider>
        </JotaiProvider>
      ),
    });

    expect(result.current).toEqual({
      pageLayoutId: DASHBOARD_PAGE_LAYOUT_ID,
      recordId: DASHBOARD_ID,
      objectMetadataItemId: DASHBOARD_OBJECT_METADATA_ID,
      objectNameSingular: 'dashboard',
    });
    expect(mockUseObjectMetadataItemById).toHaveBeenCalledWith({
      objectId: DASHBOARD_OBJECT_METADATA_ID,
    });
  });
});
