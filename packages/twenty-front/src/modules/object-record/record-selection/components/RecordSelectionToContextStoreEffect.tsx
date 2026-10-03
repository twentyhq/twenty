import { useEffect } from 'react';

import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreRecordIdsInSelectionOrderComponentState } from '@/context-store/states/contextStoreRecordIdsInSelectionOrderComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { orderRecordIdsBySelection } from '@/context-store/utils/orderRecordIdsBySelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const RecordSelectionToContextStoreEffect = () => {
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );

  const setContextStoreTargetedRecordsRule = useSetAtomComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreNumberOfSelectedRecords = useSetAtomComponentState(
    contextStoreNumberOfSelectedRecordsComponentState,
  );

  const setContextStoreRecordIdsInSelectionOrder = useSetAtomComponentState(
    contextStoreRecordIdsInSelectionOrderComponentState,
  );

  useEffect(() => {
    setContextStoreTargetedRecordsRule({
      mode: 'selection',
      selectedRecordIds,
    });
    setContextStoreNumberOfSelectedRecords(selectedRecordIds.length);
    setContextStoreRecordIdsInSelectionOrder(
      (previousRecordIdsInSelectionOrder) =>
        orderRecordIdsBySelection({
          previousRecordIdsInSelectionOrder,
          selectedRecordIds,
        }),
    );

    return () => {
      setContextStoreTargetedRecordsRule({
        mode: 'selection',
        selectedRecordIds: [],
      });
      setContextStoreNumberOfSelectedRecords(0);
    };
  }, [
    selectedRecordIds,
    setContextStoreTargetedRecordsRule,
    setContextStoreNumberOfSelectedRecords,
    setContextStoreRecordIdsInSelectionOrder,
  ]);

  return null;
};
