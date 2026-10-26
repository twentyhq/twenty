import { isDefined } from 'twenty-shared/utils';

export type KeyTuple = readonly unknown[];

// Mirrors Postgres unique semantics: a tuple holding a NULL never collides
export const findCollidingKeyTuples = ({
  sourceKeyTuples,
  destinationKeyTuples,
}: {
  sourceKeyTuples: KeyTuple[];
  destinationKeyTuples: KeyTuple[];
}): KeyTuple[] => {
  const isComparable = (keyTuple: KeyTuple) => keyTuple.every(isDefined);

  const destinationKeys = new Set(
    destinationKeyTuples
      .filter(isComparable)
      .map((keyTuple) => JSON.stringify(keyTuple)),
  );

  const collidingKeyTupleByKey = new Map<string, KeyTuple>();

  for (const keyTuple of sourceKeyTuples.filter(isComparable)) {
    const key = JSON.stringify(keyTuple);

    if (destinationKeys.has(key)) {
      collidingKeyTupleByKey.set(key, keyTuple);
    }
  }

  return [...collidingKeyTupleByKey.values()];
};
