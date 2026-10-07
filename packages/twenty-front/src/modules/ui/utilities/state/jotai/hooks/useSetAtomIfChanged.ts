import { type PrimitiveAtom, useStore } from 'jotai';
import { useCallback } from 'react';

import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetAtomIfChanged = () => {
  const store = useStore();

  return useCallback(
    <TValue>(atom: PrimitiveAtom<TValue>, value: TValue) => {
      if (!isDeeplyEqual(store.get(atom), value)) {
        store.set(atom, value);
      }
    },
    [store],
  );
};
