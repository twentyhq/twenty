import { renderHook } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { type Store } from 'jotai/vanilla/store';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { getShowPageTabListComponentId } from '@/ui/layout/show-page/utils/getShowPageTabListComponentId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const navigateAppMock = jest.fn();
const closeSidePanelMenuMock = jest.fn();
const closeDropdownMock = jest.fn();

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => navigateAppMock,
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

const getSidePanelTabListId = () =>
  getShowPageTabListComponentId({
    pageId: PAGE_INSTANCE_ID,
    targetObjectId: RECORD_ID,
  });

const getRecordPageTabListId = () =>
  getShowPageTabListComponentId({ targetObjectId: RECORD_ID });

const renderNavigateToRecordPage = ({
  activeTabIdInSidePanel,
  parentView,
}: {
  activeTabIdInSidePanel: string | null;
  parentView?: { parentViewObjectNameSingular: string };
}) => {
  let store: Store;

  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [],
    onInitializeJotaiStore: (initializedStore) => {
      store = initializedStore;

      initializedStore.set(
        activeTabIdComponentState.atomFamily({
          instanceId: getSidePanelTabListId(),
        }),
        activeTabIdInSidePanel,
      );

      if (parentView !== undefined) {
        initializedStore.set(
          contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
          }),
          parentView as never,
        );
      }
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <BaseWrapper>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: PAGE_INSTANCE_ID }}
      >
        {children}
      </SidePanelPageComponentInstanceContext.Provider>
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

  it('should carry the side panel active tab over to the record page', () => {
    const { result, getStore } = renderNavigateToRecordPage({
      activeTabIdInSidePanel: 'files',
    });

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(
      getStore().get(
        activeTabIdComponentState.atomFamily({
          instanceId: getRecordPageTabListId(),
        }),
      ),
    ).toBe('files');

    expect(navigateAppMock).toHaveBeenCalledWith(AppPath.RecordShowPage, {
      objectNameSingular: CoreObjectNameSingular.Company,
      objectRecordId: RECORD_ID,
    });
    expect(closeSidePanelMenuMock).toHaveBeenCalled();
  });

  it('should open the timeline tab when the side panel is on its home tab', () => {
    const { result, getStore } = renderNavigateToRecordPage({
      activeTabIdInSidePanel: 'home',
    });

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(
      getStore().get(
        activeTabIdComponentState.atomFamily({
          instanceId: getRecordPageTabListId(),
        }),
      ),
    ).toBe('timeline');
  });

  it.each([CoreObjectNameSingular.Note, CoreObjectNameSingular.Task])(
    'should open the rich text tab for %s when the side panel is on its home tab',
    (objectNameSingular) => {
      const { result, getStore } = renderNavigateToRecordPage({
        activeTabIdInSidePanel: 'home',
      });

      act(() => {
        result.current.navigateToRecordPage({
          objectNameSingular,
          recordId: RECORD_ID,
        });
      });

      expect(
        getStore().get(
          activeTabIdComponentState.atomFamily({
            instanceId: getRecordPageTabListId(),
          }),
        ),
      ).toBe('richText');
    },
  );

  it('should clear the parent view when it belongs to another object', () => {
    const { result, getStore } = renderNavigateToRecordPage({
      activeTabIdInSidePanel: 'home',
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
      activeTabIdInSidePanel: 'home',
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

  it('should reset the side panel navigation stack', () => {
    const { result, getStore } = renderNavigateToRecordPage({
      activeTabIdInSidePanel: 'home',
    });

    getStore().set(sidePanelNavigationStackState.atom, [
      { page: 'view-record', pageTitle: 'Company', pageId: 'x' },
    ] as never);

    act(() => {
      result.current.navigateToRecordPage({
        objectNameSingular: CoreObjectNameSingular.Company,
        recordId: RECORD_ID,
      });
    });

    expect(getStore().get(sidePanelNavigationStackState.atom)).toEqual([]);
  });
});
