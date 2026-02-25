import { atom } from 'jotai';

import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';

export const createAtomSelector = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: (callbacks: SelectorGetter) => ValueType;
}): Selector<ValueType> => {
  const derivedAtom = atom((jotaiGet) => {
    const getHelper = buildGetHelper(jotaiGet);

    return get({ get: getHelper });
  });

  derivedAtom.debugLabel = key;

  return {
    type: 'Selector',
    key,
    atom: derivedAtom,
  };
};
