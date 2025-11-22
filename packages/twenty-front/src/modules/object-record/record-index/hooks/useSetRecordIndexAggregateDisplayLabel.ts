import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { getRecordAggregateDisplayLabel } from '@/object-record/record-index/utils/getRecordndexAggregateDisplayLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetRecordIndexAggregateDisplayLabel = () => {
  const recordIndexAggregateDisplayLabelCallbackState =
    useRecoilComponentCallbackState(
      recordIndexAggregateDisplayLabelComponentState,
    );

  const setRecordIndexAggregateDisplayLabel = useRecoilCallback(
    ({ set }) =>
      (
        recordIndexGroupAggregateOperation: ExtendedAggregateOperations,
        recordIndexGroupAggregateFieldMetadataItem: FieldMetadataItem,
      ) => {
        const { aggregateLabel } = getRecordAggregateDisplayLabel({
          aggregateOperation: recordIndexGroupAggregateOperation,
          aggregateFieldMetadataItem:
            recordIndexGroupAggregateFieldMetadataItem,
        });

        set(recordIndexAggregateDisplayLabelCallbackState, aggregateLabel);
      },
    [recordIndexAggregateDisplayLabelCallbackState],
  );

  return {
    setRecordIndexAggregateDisplayLabel,
  };
};
