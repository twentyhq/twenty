import { isDefined } from 'twenty-shared/utils';

import { shiftMapKeysFromRealIndex } from '@/object-record/record-table/virtualization/utils/shiftMapKeysFromRealIndex';

type VirtualRowsShift = {
  recordIdByRealIndex: Map<number, string>;
  dataLoadingStatusByRealIndex: Map<number, 'loaded' | 'not-loaded'>;
  allRecordIds: string[];
};

export const shiftVirtualRowsFromRealIndex = ({
  recordIdByRealIndex,
  dataLoadingStatusByRealIndex,
  allRecordIds,
  fromRealIndex,
  shift,
  realIndexToDrop,
}: VirtualRowsShift & {
  fromRealIndex: number;
  shift: 1 | -1;
  realIndexToDrop?: number;
}): VirtualRowsShift => {
  const shiftedAllRecordIds: string[] = [];

  for (const realIndexAsString of Object.keys(allRecordIds)) {
    const realIndex = Number(realIndexAsString);
    const recordId = allRecordIds[realIndex];

    if (realIndex === realIndexToDrop || !isDefined(recordId)) {
      continue;
    }

    shiftedAllRecordIds[
      realIndex < fromRealIndex ? realIndex : realIndex + shift
    ] = recordId;
  }

  return {
    recordIdByRealIndex: shiftMapKeysFromRealIndex({
      map: recordIdByRealIndex,
      fromRealIndex,
      shift,
      realIndexToDrop,
    }),
    dataLoadingStatusByRealIndex: shiftMapKeysFromRealIndex({
      map: dataLoadingStatusByRealIndex,
      fromRealIndex,
      shift,
      realIndexToDrop,
    }),
    allRecordIds: shiftedAllRecordIds,
  };
};
