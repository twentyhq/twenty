import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuPreviousComponentInstanceId';
import { useSetGlobalCommandMenuContext } from '@/command-menu/hooks/useSetGlobalCommandMenuContext';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { hasUserSelectedCommandState } from '@/command-menu/states/hasUserSelectedCommandState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { getPeopleRecordConnectionMock } from '~/testing/mock-data/people';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';

const mockCopyContextStoreStates = jest.fn();
jest.mock(
  '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates',
  () => ({
    useCopyContextStoreStates: () => ({
      copyContextStoreStates: mockCopyContextStoreStates,
    }),
  }),
);

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleRecordConnectionMock();

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreCurrentViewId: 'my-view-id',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [peopleMock[0].id, peopleMock[1].id],
  },
  contextStoreNumberOfSelectedRecords: 2,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
  onInitializeRecoilSnapshot: (_snapshot) => {
    jotaiStore.set(
      recordStoreFamilyState.atomFamily(peopleMock[0].id),
      peopleMock[0],
    );
    jotaiStore.set(
      recordStoreFamilyState.atomFamily(peopleMock[1].id),
      peopleMock[1],
    );
  },
});

describe('useSetGlobalCommandMenuContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reset all command menu context states', () => {
    const { result } = renderHook(
      () => {
        const { setGlobalCommandMenuContext } =
          useSetGlobalCommandMenuContext();

        const targetedRecordsRule = useAtomComponentStateValue(
          contextStoreTargetedRecordsRuleComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const numberOfSelectedRecords = useAtomComponentStateValue(
          contextStoreNumberOfSelectedRecordsComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const filters = useAtomComponentStateValue(
          contextStoreFiltersComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const filterGroups = useAtomComponentStateValue(
          contextStoreFilterGroupsComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const anyFieldFilterValue = useAtomComponentStateValue(
          contextStoreAnyFieldFilterValueComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const currentViewType = useAtomComponentStateValue(
          contextStoreCurrentViewTypeComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        return {
          setGlobalCommandMenuContext,
          targetedRecordsRule,
          numberOfSelectedRecords,
          filters,
          filterGroups,
          currentViewType,
          anyFieldFilterValue,
        };
      },
      {
        wrapper,
      },
    );

    expect(result.current.targetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [peopleMock[0].id, peopleMock[1].id],
    });
    expect(result.current.numberOfSelectedRecords).toBe(2);
    expect(result.current.filters).toEqual([]);
    expect(result.current.anyFieldFilterValue).toEqual('');
    expect(result.current.currentViewType).toBe(ContextStoreViewType.Table);
    const commandMenuPageInfo = jotaiStore.get(commandMenuPageInfoState.atom);
    expect(commandMenuPageInfo).toEqual({
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });
    const hasUserSelectedCommand = jotaiStore.get(
      hasUserSelectedCommandState.atom,
    );
    expect(hasUserSelectedCommand).toBe(false);

    act(() => {
      result.current.setGlobalCommandMenuContext();
    });

    expect(result.current.targetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [],
    });
    expect(result.current.numberOfSelectedRecords).toBe(0);
    expect(result.current.filters).toEqual([]);
    expect(result.current.anyFieldFilterValue).toEqual('');
    expect(result.current.currentViewType).toBe(ContextStoreViewType.Table);
    const commandMenuPageInfoAfter = jotaiStore.get(
      commandMenuPageInfoState.atom,
    );
    expect(commandMenuPageInfoAfter).toEqual({
      title: undefined,
      Icon: undefined,
      instanceId: '',
    });
    const hasUserSelectedCommandAfter = jotaiStore.get(
      hasUserSelectedCommandState.atom,
    );
    expect(hasUserSelectedCommandAfter).toBe(false);
  });

  it('should call copyContextStoreStates with correct parameters', () => {
    const { result } = renderHook(() => useSetGlobalCommandMenuContext(), {
      wrapper,
    });

    act(() => {
      result.current.setGlobalCommandMenuContext();
    });

    expect(mockCopyContextStoreStates).toHaveBeenCalledWith({
      instanceIdToCopyFrom: COMMAND_MENU_COMPONENT_INSTANCE_ID,
      instanceIdToCopyTo: COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID,
    });
  });
});
