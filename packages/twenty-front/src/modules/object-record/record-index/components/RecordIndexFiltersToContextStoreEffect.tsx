import { type PrimitiveAtom, useStore } from 'jotai';
import { useEffect } from 'react';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreRecordIdsInSelectionOrderComponentState } from '@/context-store/states/contextStoreRecordIdsInSelectionOrderComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { orderRecordIdsBySelection } from '@/context-store/utils/orderRecordIdsBySelection';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
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

  const hasUserSelectedAllRecords = useAtomComponentStateValue(
    hasUserSelectedAllRecordsComponentState,
    recordIndexId,
  );

  const recordIndexAllRecordIds = useAtomComponentSelectorValue(
    recordIndexAllRecordIdsComponentSelector,
    recordIndexId,
  );

  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
    recordIndexId,
  );

  const contextStoreTargetedRecordsRuleAtom =
    useAtomComponentStateCallbackState(
      contextStoreTargetedRecordsRuleComponentState,
    );

  const contextStoreRecordIdsInSelectionOrderAtom =
    useAtomComponentStateCallbackState(
      contextStoreRecordIdsInSelectionOrderComponentState,
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
    const setIfChanged = <TValue,>(
      atom: PrimitiveAtom<TValue>,
      value: TValue,
    ) => {
      if (!isDeeplyEqual(store.get(atom), value)) {
        store.set(atom, value);
      }
    };

    const selectedRecordIdSet = new Set(selectedRecordIds);

    setIfChanged(
      contextStoreTargetedRecordsRuleAtom,
      hasUserSelectedAllRecords
        ? {
            mode: 'exclusion',
            excludedRecordIds: recordIndexAllRecordIds.filter(
              (recordId) => !selectedRecordIdSet.has(recordId),
            ),
          }
        : { mode: 'selection', selectedRecordIds },
    );

    setIfChanged(
      contextStoreRecordIdsInSelectionOrderAtom,
      orderRecordIdsBySelection({
        previousRecordIdsInSelectionOrder: store.get(
          contextStoreRecordIdsInSelectionOrderAtom,
        ),
        selectedRecordIds: hasUserSelectedAllRecords ? [] : selectedRecordIds,
      }),
    );

    setIfChanged(contextStoreFiltersAtom, currentRecordFilters);
    setIfChanged(contextStoreFilterGroupsAtom, currentRecordFilterGroups);
    setIfChanged(contextStoreAnyFieldFilterValueAtom, anyFieldFilterValue);

    return () => {
      setIfChanged(contextStoreTargetedRecordsRuleAtom, {
        mode: 'selection',
        selectedRecordIds: [],
      });
      setIfChanged(contextStoreFiltersAtom, []);
      setIfChanged(contextStoreAnyFieldFilterValueAtom, '');
    };
  }, [
    anyFieldFilterValue,
    contextStoreAnyFieldFilterValueAtom,
    contextStoreFilterGroupsAtom,
    contextStoreFiltersAtom,
    contextStoreRecordIdsInSelectionOrderAtom,
    contextStoreTargetedRecordsRuleAtom,
    currentRecordFilterGroups,
    currentRecordFilters,
    hasUserSelectedAllRecords,
    recordIndexAllRecordIds,
    selectedRecordIds,
    store,
  ]);

  return null;
};
