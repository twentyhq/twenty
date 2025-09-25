import { recordIdPerRealIndexComponentFamilyState } from '@/object-record/record-table/virtualization/states/recordIdPerRealIndexComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetRecordIdsByRealIndices = () => {
  const recordIdPerRealIndexFamilyCallbackState =
    useRecoilComponentCallbackState(recordIdPerRealIndexComponentFamilyState);

  const setRecordIdsByRealIndices = useRecoilCallback(
    ({ set }) =>
      (records: ObjectRecord[]) => {
        for (const [realIndex, record] of records.entries()) {
          set(recordIdPerRealIndexFamilyCallbackState(realIndex), record.id);
        }
      },
    [recordIdPerRealIndexFamilyCallbackState],
  );

  return { setRecordIdsByRealIndices };
};
