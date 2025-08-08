import { Snapshot } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

export const getRecordPositionDataFromSnapshot = ({
  allRecordIds,
  snapshot,
}: {
  allRecordIds: string[];
  snapshot: Snapshot;
}) => {
  return allRecordIds.map((recordId) => {
    const record = getSnapshotValue(snapshot, recordStoreFamilyState(recordId));
    return {
      recordId,
      position: record?.position,
    };
  });
};
