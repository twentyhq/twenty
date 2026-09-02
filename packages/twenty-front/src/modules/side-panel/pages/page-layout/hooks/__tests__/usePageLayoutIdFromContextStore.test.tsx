import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import {
  usePageLayoutIdFromContextStore,
  usePageLayoutIdFromContextStoreOrNull,
} from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconTable } from 'twenty-ui/icon';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const DASHBOARD_ID = 'dashboard-id';
const DASHBOARD_PAGE_LAYOUT_ID = 'dashboard-page-layout-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';
const dashboardObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('dashboard');

const getWrapperWithCapturedPageLayoutId = (
  capturedPageLayoutId: string | null,
) => {
  const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (store) => {
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
            pageLayoutId: capturedPageLayoutId,
            recordId: DASHBOARD_ID,
            objectMetadataItemId: dashboardObjectMetadataItem.id,
            objectNameSingular: 'dashboard',
          },
        },
      ]);
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataWrapper>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <WorkspaceSurfaceContext.Provider
          value={{
            type: 'side-panel',
            instanceId: 'side-panel-page-id',
            ownsRouteLocation: false,
          }}
        >
          {children}
        </WorkspaceSurfaceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </MetadataWrapper>
  );

  return wrapper;
};

describe('usePageLayoutIdFromContextStore', () => {
  it('keeps the captured page layout context during a main route transition', () => {
    const wrapper = getWrapperWithCapturedPageLayoutId(
      DASHBOARD_PAGE_LAYOUT_ID,
    );

    const { result } = renderHook(() => usePageLayoutIdFromContextStore(), {
      wrapper,
    });

    expect(result.current).toEqual({
      pageLayoutId: DASHBOARD_PAGE_LAYOUT_ID,
      recordId: DASHBOARD_ID,
      objectMetadataItemId: dashboardObjectMetadataItem.id,
      objectNameSingular: 'dashboard',
    });
  });

  it('keeps a null page layout context during a main route transition', () => {
    const wrapper = getWrapperWithCapturedPageLayoutId(null);

    const { result } = renderHook(
      () => usePageLayoutIdFromContextStoreOrNull(),
      { wrapper },
    );

    expect(result.current).toEqual({
      pageLayoutId: null,
      recordId: DASHBOARD_ID,
      objectMetadataItemId: dashboardObjectMetadataItem.id,
      objectNameSingular: 'dashboard',
    });
  });
});
