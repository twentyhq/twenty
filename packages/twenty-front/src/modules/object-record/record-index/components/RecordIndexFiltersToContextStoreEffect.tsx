import { useEffect, useMemo } from 'react';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import {
  contextStoreTargetedRecordsRuleComponentState,
  type ContextStoreTargetedRecordsRule,
} from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { unselectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/unselectedRowIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { atom, useStore } from 'jotai';
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

  const syncWriteAtom = useMemo(
    () =>
      atom(
        null,
        (
          get,
          set,
          payload: {
            filters: RecordFilter[];
            filterGroups: RecordFilterGroup[];
            anyFieldFilterValue: string;
          },
        ) => {
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

          const currentRule = get(contextStoreTargetedRecordsRuleAtom);
          if (!isDeeplyEqual(currentRule, newRule)) {
            set(contextStoreTargetedRecordsRuleAtom, newRule);
          }

          const currentFilters = get(contextStoreFiltersAtom);
          if (!isDeeplyEqual(currentFilters, payload.filters)) {
            set(contextStoreFiltersAtom, payload.filters);
          }

          const currentFilterGroups = get(contextStoreFilterGroupsAtom);
          if (!isDeeplyEqual(currentFilterGroups, payload.filterGroups)) {
            set(contextStoreFilterGroupsAtom, payload.filterGroups);
          }

          const currentAnyFieldFilter = get(
            contextStoreAnyFieldFilterValueAtom,
          );
          if (currentAnyFieldFilter !== payload.anyFieldFilterValue) {
            set(
              contextStoreAnyFieldFilterValueAtom,
              payload.anyFieldFilterValue,
            );
          }
        },
      ),
    [
      hasUserSelectedAllRows,
      selectedRowIds,
      unselectedRowIds,
      contextStoreTargetedRecordsRuleAtom,
      contextStoreFiltersAtom,
      contextStoreFilterGroupsAtom,
      contextStoreAnyFieldFilterValueAtom,
    ],
  );

  const resetWriteAtom = useMemo(
    () =>
      atom(null, (get, set) => {
        const currentRule = get(contextStoreTargetedRecordsRuleAtom);
        const resetRule: ContextStoreTargetedRecordsRule = {
          mode: 'selection',
          selectedRecordIds: [],
        };
        if (!isDeeplyEqual(currentRule, resetRule)) {
          set(contextStoreTargetedRecordsRuleAtom, resetRule);
        }

        const currentFilters = get(contextStoreFiltersAtom);
        if (!isDeeplyEqual(currentFilters, [])) {
          set(contextStoreFiltersAtom, []);
        }

        const currentAnyFieldFilter = get(contextStoreAnyFieldFilterValueAtom);
        if (currentAnyFieldFilter !== '') {
          set(contextStoreAnyFieldFilterValueAtom, '');
        }
      }),
    [
      contextStoreTargetedRecordsRuleAtom,
      contextStoreFiltersAtom,
      contextStoreAnyFieldFilterValueAtom,
    ],
  );

  useEffect(() => {
    store.set(syncWriteAtom, {
      filters: currentRecordFilters,
      filterGroups: currentRecordFilterGroups,
      anyFieldFilterValue,
    });

    return () => {
      store.set(resetWriteAtom);
    };
  }, [
    currentRecordFilters,
    currentRecordFilterGroups,
    anyFieldFilterValue,
    store,
    syncWriteAtom,
    resetWriteAtom,
  ]);

  return <></>;
};
