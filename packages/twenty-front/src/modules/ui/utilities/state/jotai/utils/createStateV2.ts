import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const createStateV2 = <ValueType>({
  key,
  defaultValue,
  useLocalStorage = false,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
}): StateV2<ValueType> => {
  const baseAtom = useLocalStorage
    ? atomWithStorage<ValueType>(key, defaultValue)
    : atom(defaultValue);
  baseAtom.debugLabel = key;

  return {
    type: 'StateV2',
    key,
    atom: baseAtom,
  };
};
