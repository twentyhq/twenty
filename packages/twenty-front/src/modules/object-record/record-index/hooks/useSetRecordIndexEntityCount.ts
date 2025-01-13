import { recordIndexEntityCountByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexEntityCountByGroupComponentFamilyState';
import { recordIndexEntityCountNoGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexEntityCountNoGroupComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilCallback } from 'recoil';
import { isDefined } from '~/utils/isDefined';

export const useSetRecordIndexEntityCount = (viewBarComponentId?: string) => {
  const recordIndexEntityCountNoGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexEntityCountNoGroupComponentFamilyState,
      viewBarComponentId,
    );

  const recordIndexEntityCountByGroupFamilyState =
    useRecoilComponentCallbackStateV2(
      recordIndexEntityCountByGroupComponentFamilyState,
      viewBarComponentId,
    );

  const setRecordIndexEntityCount = useRecoilCallback(
    ({ set }) =>
      (count: number, recordGroupId?: string) => {
        if (isDefined(recordGroupId)) {
          set(recordIndexEntityCountByGroupFamilyState(recordGroupId), count);
        } else {
          set(recordIndexEntityCountNoGroupFamilyState, count);
        }
      },
    [
      recordIndexEntityCountByGroupFamilyState,
      recordIndexEntityCountNoGroupFamilyState,
    ],
  );

  return {
    setRecordIndexEntityCount,
  };
};
