import { useEffect } from 'react';

import { contextStoreRecordIdsInSelectionOrderComponentState } from '@/context-store/states/contextStoreRecordIdsInSelectionOrderComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { orderRecordIdsBySelection } from '@/context-store/utils/orderRecordIdsBySelection';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const RecordBoardSelectRecordsEffect = () => {
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );

  const setContextStoreTargetedRecordsRule = useSetAtomComponentState(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const setContextStoreRecordIdsInSelectionOrder = useSetAtomComponentState(
    contextStoreRecordIdsInSelectionOrderComponentState,
  );

  useEffect(() => {
    setContextStoreTargetedRecordsRule({
      mode: 'selection',
      selectedRecordIds: selectedRecordIds,
    });
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
    };
  }, [
    selectedRecordIds,
    setContextStoreTargetedRecordsRule,
    setContextStoreRecordIdsInSelectionOrder,
  ]);

  return <></>;
};
