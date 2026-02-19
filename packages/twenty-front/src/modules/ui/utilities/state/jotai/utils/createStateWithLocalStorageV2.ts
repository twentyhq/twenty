import { atomWithStorage } from 'jotai/utils';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const createStateWithLocalStorageV2 = <ValueType>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}): StateV2<ValueType> => {
  const baseAtom = atomWithStorage<ValueType>(key, defaultValue);
  baseAtom.debugLabel = key;

  return {
    type: 'StateV2',
    key,
    atom: baseAtom,
  };
};
