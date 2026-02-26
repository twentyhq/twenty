import { useEffect } from 'react';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import {
  contextStoreTargetedRecordsRuleComponentState,
  type ContextStoreTargetedRecordsRule,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { unselectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/unselectedRowIdsComponentSelector';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RecordIndexFiltersToContextStoreEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const store = useStore();

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    recordIndexId,
  );

  const hasUserSelectedAllRows = useAtomComponentStateValue(
    hasUserSelectedAllRowsComponentState,
    recordIndexId,
  );

  const selectedRowIds = useAtomComponentSelectorValue(
    selectedRowIdsComponentSelector,
    recordIndexId,
  );

  const unselectedRowIds = useAtomComponentSelectorValue(
    unselectedRowIdsComponentSelector,
    recordIndexId,
  );

  const contextStoreTargetedRecordsRuleAtom =
    useAtomComponentStateCallbackState(
      contextStoreTargetedRecordsRuleComponentState,
    );

  const contextStoreFiltersAtom = useAtomComponentStateCallbackState(
    contextStoreFiltersComponentState,
  );

  const contextStoreFilterGroupsAtom = useAtomComponentStateCallbackState(
    contextStoreFilterGroupsComponentState,
  );

  const contextStoreAnyFieldFilterValueAtom =
    useAtomComponentStateCallbackState(
      contextStoreAnyFieldFilterValueComponentState,
    );

  useEffect(() => {
    let newRule: ContextStoreTargetedRecordsRule;

    if (hasUserSelectedAllRows) {
      newRule = {
        mode: 'exclusion',
        excludedRecordIds: unselectedRowIds,
      };
    } else {
      newRule = {
        mode: 'selection',
        selectedRecordIds: selectedRowIds,
      };
    }

    const currentRule = store.get(contextStoreTargetedRecordsRuleAtom);
    if (!isDeeplyEqual(currentRule, newRule)) {
      store.set(contextStoreTargetedRecordsRuleAtom, newRule);
    }

    const currentFilters = store.get(contextStoreFiltersAtom);
    if (!isDeeplyEqual(currentFilters, currentRecordFilters)) {
      store.set(contextStoreFiltersAtom, currentRecordFilters);
    }

    const currentFilterGroups = store.get(contextStoreFilterGroupsAtom);
    if (!isDeeplyEqual(currentFilterGroups, currentRecordFilterGroups)) {
      store.set(contextStoreFilterGroupsAtom, currentRecordFilterGroups);
    }

    const currentAnyFieldFilter = store.get(
      contextStoreAnyFieldFilterValueAtom,
    );
    if (currentAnyFieldFilter !== anyFieldFilterValue) {
      store.set(contextStoreAnyFieldFilterValueAtom, anyFieldFilterValue);
    }

    return () => {
      store.set(contextStoreTargetedRecordsRuleAtom, {
        mode: 'selection',
        selectedRecordIds: [],
      });
      store.set(contextStoreFiltersAtom, []);
      store.set(contextStoreAnyFieldFilterValueAtom, '');
    };
  }, [
    hasUserSelectedAllRows,
    selectedRowIds,
    unselectedRowIds,
    currentRecordFilters,
    currentRecordFilterGroups,
    anyFieldFilterValue,
    store,
    contextStoreTargetedRecordsRuleAtom,
    contextStoreFiltersAtom,
    contextStoreFilterGroupsAtom,
    contextStoreAnyFieldFilterValueAtom,
  ]);

  return <></>;
};
