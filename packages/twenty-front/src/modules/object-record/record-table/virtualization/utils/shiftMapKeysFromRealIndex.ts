export const shiftMapKeysFromRealIndex = <TValue>({
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
