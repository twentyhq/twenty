import { useRegisteredCommandMenuItems } from '@/command-menu-item/hooks/useRegisteredCommandMenuItems';
import { CommandMenuItemScope } from '@/command-menu-item/types/CommandMenuItemScope';
import { CommandMenuItemType } from '@/command-menu-item/types/CommandMenuItemType';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { CommandMenuItemViewType } from 'twenty-shared/types';
import { Icon123 } from 'twenty-ui/display';

jest.mock('@/command-menu-item/utils/getCommandMenuItemConfig', () => ({
  getCommandMenuItemConfig: () => ({}),
}));

jest.mock(
  '@/command-menu-item/record-agnostic/hooks/useRelatedRecordCommands',
  () => ({
    useRelatedRecordCommands: () => ({}),
  }),
);

jest.mock('@/settings/roles/hooks/usePermissionFlagMap', () => ({
  usePermissionFlagMap: () => ({}),
}));

jest.mock(
  '@/command-menu-item/record-agnostic/hooks/useRecordAgnosticCommands',
  () => ({
    useRecordAgnosticCommands: () => ({
      pageEditItem: {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Global,
        key: 'page-edit-item',
        label: 'Page Edit Item',
        position: 0,
        Icon: Icon123,
        availableOn: [CommandMenuItemViewType.PAGE_EDIT_MODE],
        shouldBeRegistered: () => true,
        component: null,
      },
      showItem: {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Global,
        key: 'show-item',
        label: 'Show Item',
        position: 1,
        Icon: Icon123,
        availableOn: [CommandMenuItemViewType.SHOW_PAGE],
        shouldBeRegistered: () => true,
        component: null,
      },
      globalItem: {
        type: CommandMenuItemType.Standard,
        scope: CommandMenuItemScope.Global,
        key: 'global-item',
        label: 'Global Item',
        position: 2,
        Icon: Icon123,
        availableOn: [CommandMenuItemViewType.GLOBAL],
        shouldBeRegistered: () => true,
        component: null,
      },
    }),
  }),
);

const CONTEXT_STORE_INSTANCE_ID = 'test-context-store-instance-id';

const getWrapper = (store = createStore()) => {
  return ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: CONTEXT_STORE_INSTANCE_ID }}
      >
        {children}
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );
};

const shouldBeRegisteredParams = {
  objectPermissions: {
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    objectMetadataId: '',
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  getTargetObjectReadPermission: () => true,
  getTargetObjectWritePermission: () => true,
  isFeatureFlagEnabled: () => true,
};

describe('useRegisteredCommandMenuItems', () => {
  it('should register SHOW_PAGE and GLOBAL commands when page is not in edit mode', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(
      contextStoreCurrentViewTypeComponentState.atomFamily({
        instanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
      ContextStoreViewType.ShowPage,
    );
    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
      { mode: 'selection', selectedRecordIds: [] },
    );

    act(() => {
      store.set(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: CONTEXT_STORE_INSTANCE_ID,
        }),
        false,
      );
    });

    const { result } = renderHook(
      () =>
        useRegisteredCommandMenuItems(
          shouldBeRegisteredParams as Parameters<
            typeof useRegisteredCommandMenuItems
          >[0],
        ),
      {
        wrapper,
      },
    );

    expect(result.current.map((item) => item.key)).toEqual([
      'show-item',
      'global-item',
    ]);
  });

  it('should register PAGE_EDIT_MODE commands when page is in edit mode', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(
      contextStoreCurrentViewTypeComponentState.atomFamily({
        instanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
      ContextStoreViewType.ShowPage,
    );
    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: CONTEXT_STORE_INSTANCE_ID,
      }),
      { mode: 'selection', selectedRecordIds: [] },
    );

    act(() => {
      store.set(
        contextStoreIsPageInEditModeComponentState.atomFamily({
          instanceId: CONTEXT_STORE_INSTANCE_ID,
        }),
        true,
      );
    });

    const { result } = renderHook(
      () =>
        useRegisteredCommandMenuItems(
          shouldBeRegisteredParams as Parameters<
            typeof useRegisteredCommandMenuItems
          >[0],
        ),
      {
        wrapper,
      },
    );

    expect(result.current.map((item) => item.key)).toEqual(['page-edit-item']);
  });
});
