import { atom } from 'jotai';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';

export const createStateV2 = <ValueType>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: ValueType;
}): StateV2<ValueType> => {
  const baseAtom = atom(defaultValue);
  baseAtom.debugLabel = key;

  return {
    type: 'StateV2',
    key,
    atom: baseAtom,
  };
};
