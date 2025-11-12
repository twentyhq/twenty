import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type RecordWithPosition } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { type Snapshot } from 'recoil';

export const extractRecordPositions = (
  recordIds: string[],
  snapshot: Snapshot,
): RecordWithPosition[] => {
  return recordIds.map((recordId) => {
    const record = snapshot
      .getLoadable(recordStoreFamilyState(recordId))
      .getValue();

    return {
      id: recordId,
      position: record?.position,
    };
  });
};
