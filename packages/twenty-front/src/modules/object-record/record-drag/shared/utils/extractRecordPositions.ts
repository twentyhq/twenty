import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type Snapshot } from 'recoil';

export const extractRecordPositions = (
  recordIds: string[],
  snapshot: Snapshot,
) => {
  return recordIds.map((recordId) => {
    const record = snapshot
      .getLoadable(recordStoreFamilyState(recordId))
      .getValue();
    return {
      recordId,
      position: record?.position,
    };
  });
};
