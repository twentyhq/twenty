import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { getRecordAggregateDisplayLabel } from '@/object-record/record-index/utils/getRecordndexAggregateDisplayLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';

export const useSetRecordIndexAggregateDisplayLabel = () => {
  const recordIndexAggregateDisplayLabel = useAtomComponentStateCallbackState(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const store = useStore();

  const setRecordIndexAggregateDisplayLabel = (
    recordIndexGroupAggregateOperation: ExtendedAggregateOperations,
    recordIndexGroupAggregateFieldMetadataItem: FieldMetadataItem,
  ) => {
    const { aggregateLabel } = getRecordAggregateDisplayLabel({
      aggregateOperation: recordIndexGroupAggregateOperation,
      aggregateFieldMetadataItem: recordIndexGroupAggregateFieldMetadataItem,
    });

    store.set(recordIndexAggregateDisplayLabel, aggregateLabel);
  };

  return {
    setRecordIndexAggregateDisplayLabel,
  };
};
