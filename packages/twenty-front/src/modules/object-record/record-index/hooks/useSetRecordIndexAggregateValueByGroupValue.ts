import { recordAggregateValueByRecordGroupValueComponentFamilyState } from '@/object-record/record-group/states/recordAggregateValueByRecordGroupValueComponentFamilyState';
import { type RecordAggregateValueByRecordGroupValue } from '@/object-record/record-index/types/RecordAggregateValueByRecordGroupValue';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetRecordIndexAggregateValueByGroupValue = () => {
  const recordIndexAggregateValueByGroupValueCallbackState =
    useRecoilComponentCallbackState(
      recordAggregateValueByRecordGroupValueComponentFamilyState,
    );

  const setRecordIndexAggregateValueByGroupValue = useRecoilCallback(
    ({ set }) =>
      (
        aggregateValueByRecordGroupValueArray: RecordAggregateValueByRecordGroupValue[],
      ) => {
        for (const aggregateValueByGroupValue of aggregateValueByRecordGroupValueArray) {
          set(
            recordIndexAggregateValueByGroupValueCallbackState({
              groupValue: aggregateValueByGroupValue.recordGroupValue,
            }),
            aggregateValueByGroupValue.recordAggregateValue,
          );
        }
      },
    [recordIndexAggregateValueByGroupValueCallbackState],
  );

  return {
    setRecordIndexAggregateValueByGroupValue,
  };
};
