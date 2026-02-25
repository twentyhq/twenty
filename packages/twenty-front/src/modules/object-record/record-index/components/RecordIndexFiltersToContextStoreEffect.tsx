import { useCallback, useEffect, useMemo, useRef } from 'react';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { type ContextStoreTargetedRecordsRule } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { hasUserSelectedAllRowsComponentState } from '@/object-record/record-table/record-table-row/states/hasUserSelectedAllRowsFamilyState';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { unselectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/unselectedRowIdsComponentSelector';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { atom, useStore } from 'jotai';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const RecordIndexFiltersToContextStoreEffect = () => {
  const { recordIndexId } = useRecordIndexContextOrThrow();

  const store = useStore();

  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[FiltersToCtxStore] RENDER #${renderCount.current}`);

  const recordIndexFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
    recordIndexId,
  );

  const recordIndexFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
    recordIndexId,
  );

  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
    recordIndexId,
  );

  const hasUserSelectedAllRowsAtom = useAtomComponentStateCallbackState(
    hasUserSelectedAllRowsComponentState,
    recordIndexId,
  );

  const selectedRowIdsAtom = useAtomComponentSelectorCallbackState(
    selectedRowIdsComponentSelector,
    recordIndexId,
  );

  const unselectedRowIdsAtom = useAtomComponentSelectorCallbackState(
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

  const syncAllWriteAtom = useMemo(
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
          console.log('[FiltersToCtxStore] syncAllWriteAtom called');

          // Sync selection
          const hasUserSelectedAllRows = get(hasUserSelectedAllRowsAtom);
          let newRule: ContextStoreTargetedRecordsRule;

          if (hasUserSelectedAllRows) {
            const unselectedRowIds = get(unselectedRowIdsAtom);
            newRule = {
              mode: 'exclusion',
              excludedRecordIds: unselectedRowIds,
            };
          } else {
            const selectedRowIds = get(selectedRowIdsAtom);
            newRule = {
              mode: 'selection',
              selectedRecordIds: selectedRowIds,
            };
          }

          const currentRule = get(contextStoreTargetedRecordsRuleAtom);
          if (!isDeeplyEqual(currentRule, newRule)) {
            console.log('[FiltersToCtxStore] WRITING targetedRecordsRule');
            set(contextStoreTargetedRecordsRuleAtom, newRule);
          }

          // Sync filters
          const currentFilters = get(contextStoreFiltersAtom);
          if (!isDeeplyEqual(currentFilters, payload.filters)) {
            console.log('[FiltersToCtxStore] WRITING filters');
            set(contextStoreFiltersAtom, payload.filters);
          }

          const currentFilterGroups = get(contextStoreFilterGroupsAtom);
          if (!isDeeplyEqual(currentFilterGroups, payload.filterGroups)) {
            console.log('[FiltersToCtxStore] WRITING filterGroups');
            set(contextStoreFilterGroupsAtom, payload.filterGroups);
          }

          // Sync anyFieldFilter
          const currentAnyFieldFilter = get(
            contextStoreAnyFieldFilterValueAtom,
          );
          if (currentAnyFieldFilter !== payload.anyFieldFilterValue) {
            console.log('[FiltersToCtxStore] WRITING anyFieldFilter');
            set(contextStoreAnyFieldFilterValueAtom, payload.anyFieldFilterValue);
          }
        },
      ),
    [
      hasUserSelectedAllRowsAtom,
      selectedRowIdsAtom,
      unselectedRowIdsAtom,
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

  const syncAll = useCallback(
    (
      filters: RecordFilter[],
      filterGroups: RecordFilterGroup[],
      anyFieldFilter: string,
    ) => {
      store.set(syncAllWriteAtom, {
        filters,
        filterGroups,
        anyFieldFilterValue: anyFieldFilter,
      });
    },
    [store, syncAllWriteAtom],
  );

  const resetAll = useCallback(() => {
    store.set(resetWriteAtom);
  }, [store, resetWriteAtom]);

  useEffect(() => {
    console.log('[FiltersToCtxStore] EFFECT fired', {
      filtersCount: recordIndexFilters.length,
      filterGroupsCount: recordIndexFilterGroups.length,
      anyFieldFilterValue,
    });
    syncAll(recordIndexFilters, recordIndexFilterGroups, anyFieldFilterValue);

    return () => {
      console.log('[FiltersToCtxStore] EFFECT cleanup');
      resetAll();
    };
  }, [
    recordIndexFilters,
    recordIndexFilterGroups,
    anyFieldFilterValue,
    syncAll,
    resetAll,
  ]);

  return <></>;
};
