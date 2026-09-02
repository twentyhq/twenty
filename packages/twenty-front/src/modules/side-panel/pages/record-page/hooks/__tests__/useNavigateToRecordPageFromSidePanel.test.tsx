import { renderHook } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { type Store } from 'jotai/vanilla/store';
import {
  AppPath,
  CoreObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconDotsVertical } from 'twenty-ui/icon';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { computeRecordShowComponentInstanceId } from '@/object-record/record-show/utils/computeRecordShowComponentInstanceId';
import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const navigateMock = jest.fn();
const closeSidePanelMenuMock = jest.fn();
const closeDropdownMock = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => navigateMock,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: closeSidePanelMenuMock,
  }),
}));

jest.mock('@/ui/layout/dropdown/hooks/useCloseDropdown', () => ({
  useCloseDropdown: () => ({ closeDropdown: closeDropdownMock }),
}));

const PAGE_INSTANCE_ID = 'side-panel-page-instance-id';
const RECORD_ID = 'b1c2d3e4-0000-4000-8000-000000000000';

const renderNavigateToRecordPage = ({
  currentRoutedPath,
  parentView,
}: {
  currentRoutedPath?: string;
  parentView?: { parentViewObjectNameSingular: string };
}) => {
  let store: Store;

  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;

      if (currentRoutedPath !== undefined) {
        const parsedUrl = new URL(currentRoutedPath, 'https://twenty.test');
        initializedStore.set(sidePanelNavigationStackState.atom, [
          {
            page: SidePanelPages.RoutedPage,
            pageTitle: 'Company',
            pageIcon: IconDotsVertical,
            pageId: PAGE_INSTANCE_ID,
            routedLocation: {
              pathname: parsedUrl.pathname,
              search: parsedUrl.search,
              hash: parsedUrl.hash,
              state: null,
              key: 'record-route',
            },
          },
        ]);
      }

      if (parentView !== undefined) {
        // The panel page holds it, since that is the surface the peek read it
        // from; expanding is what moves it to the main one.
        initializedStore.set(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: PAGE_INSTANCE_ID,
          }),
          parentView as never,
        );
      }
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <SidePanelPageComponentInstanceContext.Provider
          value={{ instanceId: PAGE_INSTANCE_ID }}
        >
          <WorkspaceSurfaceContext.Provider
            value={{
              type: 'side-panel',
              instanceId: PAGE_INSTANCE_ID,
              ownsRouteLocation: true,
            }}
          >
            {children}
          </WorkspaceSurfaceContext.Provider>
        </SidePanelPageComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </BaseWrapper>
  );

  const { result } = renderHook(() => useNavigateToRecordPageFromSidePanel(), {
    wrapper,
  });

  return { result, getStore: () => store };
};

describe('useNavigateToRecordPageFromSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('expands the canonical routed record path, including query and tab hash', () => {
    const recordPath = `${getAppPath(
      AppPath.RecordShowPage,
      {
        objectNameSingular: CoreObjectNameSingular.Company,
        objectRecordId: RECORD_ID,
      },
      { viewId: 'company-view' },
    )}#files`;
    const { result } = renderNavigateToRecordPage({
      currentRoutedPath: recordPath,
    });

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(navigateMock).toHaveBeenCalledWith(recordPath, { surface: 'main' });
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
    expect(closeDropdownMock).toHaveBeenCalledWith(
      getSidePanelCommandMenuDropdownIdFromCommandMenuId(
        `${computeRecordShowComponentInstanceId(RECORD_ID)}-${PAGE_INSTANCE_ID}`,
      ),
    );
  });

  it('uses the canonical timeline hash for a legacy record panel', () => {
    const { result } = renderNavigateToRecordPage({});

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(navigateMock).toHaveBeenCalledWith(
      `${getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Company,
        objectRecordId: RECORD_ID,
      })}#timeline`,
      { surface: 'main' },
    );
  });

  it.each([CoreObjectNameSingular.Note, CoreObjectNameSingular.Task])(
    'should open the rich text tab for %s when the side panel is on its home tab',
    (objectNameSingular) => {
      const { result } = renderNavigateToRecordPage({});

      act(() => {
        result.current.navigateToRecordPage({
          objectNameSingular,
          recordId: RECORD_ID,
        });
      });

      expect(navigateMock).toHaveBeenCalledWith(
        `${getAppPath(AppPath.RecordShowPage, {
          objectNameSingular,
          objectRecordId: RECORD_ID,
        })}#richText`,
        { surface: 'main' },
      );
    },
  );

  it('should clear the parent view when it belongs to another object', () => {
    const { result, getStore } = renderNavigateToRecordPage({
      parentView: {
        parentViewObjectNameSingular: CoreObjectNameSingular.Person,
      },
    });

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(
      getStore().get(
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toBeUndefined();
  });

  it('should keep the parent view when it belongs to the same object', () => {
    const parentView = {
      parentViewObjectNameSingular: CoreObjectNameSingular.Company,
    };

    const { result, getStore } = renderNavigateToRecordPage({
      parentView,
    });

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(
      getStore().get(
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      ),
    ).toMatchObject(parentView);
  });

  it('keeps the side panel navigation stack until close cleanup runs', () => {
    const { result, getStore } = renderNavigateToRecordPage({});

    getStore().set(sidePanelNavigationStackState.atom, [
      { page: 'view-record', pageTitle: 'Company', pageId: 'x' },
    ] as never);

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(getStore().get(sidePanelNavigationStackState.atom)).toEqual([
      { page: 'view-record', pageTitle: 'Company', pageId: 'x' },
    ]);
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });
});
