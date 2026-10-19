import { isDefined } from 'twenty-shared/utils';

type VirtualRowsShift = {
  recordIdByRealIndex: Map<number, string>;
  dataLoadingStatusByRealIndex: Map<number, 'loaded' | 'not-loaded'>;
  allRecordIds: string[];
};

const shiftMapKeys = <TValue>({
  map,
  fromRealIndex,
  shift,
  realIndexToDrop,
}: {
  map: Map<number, TValue>;
  fromRealIndex: number;
  shift: 1 | -1;
  realIndexToDrop?: number;
}): Map<number, TValue> => {
  const shiftedMap = new Map<number, TValue>();

  for (const [realIndex, value] of map) {
    if (realIndex === realIndexToDrop) {
      continue;
    }

    shiftedMap.set(
      realIndex < fromRealIndex ? realIndex : realIndex + shift,
      value,
    );
  }

  return shiftedMap;
};

// allRecordIds is sparse: only loaded indices hold a value
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
    recordIdByRealIndex: shiftMapKeys({
      map: recordIdByRealIndex,
      fromRealIndex,
      shift,
      realIndexToDrop,
    }),
    dataLoadingStatusByRealIndex: shiftMapKeys({
      map: dataLoadingStatusByRealIndex,
      fromRealIndex,
      shift,
      realIndexToDrop,
    }),
    allRecordIds: shiftedAllRecordIds,
  };
};
