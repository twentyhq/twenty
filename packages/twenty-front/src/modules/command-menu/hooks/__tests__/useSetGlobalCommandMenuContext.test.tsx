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

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const peopleMock = getPeopleRecordConnectionMock();

jotaiStore.set(
  recordStoreFamilyState.atomFamily(peopleMock[0].id),
  peopleMock[0],
);
jotaiStore.set(
  recordStoreFamilyState.atomFamily(peopleMock[1].id),
  peopleMock[1],
);

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

        const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
          contextStoreTargetedRecordsRuleComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
          contextStoreNumberOfSelectedRecordsComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const contextStoreFilters = useAtomComponentStateValue(
          contextStoreFiltersComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const contextStoreFilterGroups = useAtomComponentStateValue(
          contextStoreFilterGroupsComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const contextStoreAnyFieldFilterValue = useAtomComponentStateValue(
          contextStoreAnyFieldFilterValueComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        const contextStoreCurrentViewType = useAtomComponentStateValue(
          contextStoreCurrentViewTypeComponentState,
          COMMAND_MENU_COMPONENT_INSTANCE_ID,
        );

        return {
          setGlobalCommandMenuContext,
          contextStoreTargetedRecordsRule,
          contextStoreNumberOfSelectedRecords,
          contextStoreFilters,
          contextStoreFilterGroups,
          contextStoreCurrentViewType,
          contextStoreAnyFieldFilterValue,
        };
      },
      {
        wrapper,
      },
    );

    expect(result.current.contextStoreTargetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [peopleMock[0].id, peopleMock[1].id],
    });
    expect(result.current.contextStoreNumberOfSelectedRecords).toBe(2);
    expect(result.current.contextStoreFilters).toEqual([]);
    expect(result.current.contextStoreAnyFieldFilterValue).toEqual('');
    expect(result.current.contextStoreCurrentViewType).toBe(
      ContextStoreViewType.Table,
    );
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

    expect(result.current.contextStoreTargetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [],
    });
    expect(result.current.contextStoreNumberOfSelectedRecords).toBe(0);
    expect(result.current.contextStoreFilters).toEqual([]);
    expect(result.current.contextStoreAnyFieldFilterValue).toEqual('');
    expect(result.current.contextStoreCurrentViewType).toBe(
      ContextStoreViewType.Table,
    );
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

  it('should copy context store states to previous instance before resetting', () => {
    const { result } = renderHook(
      () => {
        const { setGlobalCommandMenuContext } =
          useSetGlobalCommandMenuContext();

        // eslint-disable-next-line twenty/matching-state-variable
        const previousTargetedRecordsRule = useAtomComponentStateValue(
          contextStoreTargetedRecordsRuleComponentState,
          COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID,
        );

        // eslint-disable-next-line twenty/matching-state-variable
        const previousNumberOfSelectedRecords = useAtomComponentStateValue(
          contextStoreNumberOfSelectedRecordsComponentState,
          COMMAND_MENU_PREVIOUS_COMPONENT_INSTANCE_ID,
        );

        return {
          setGlobalCommandMenuContext,
          previousTargetedRecordsRule,
          previousNumberOfSelectedRecords,
        };
      },
      {
        wrapper,
      },
    );

    act(() => {
      result.current.setGlobalCommandMenuContext();
    });

    expect(result.current.previousTargetedRecordsRule).toEqual({
      mode: 'selection',
      selectedRecordIds: [peopleMock[0].id, peopleMock[1].id],
    });
    expect(result.current.previousNumberOfSelectedRecords).toBe(2);
  });
});
