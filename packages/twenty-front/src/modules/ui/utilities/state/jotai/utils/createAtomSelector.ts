import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { type SelectorGetter } from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { type Selector } from '@/ui/utilities/state/jotai/types/Selector';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { isDefined } from 'twenty-shared/utils';

export const createAtomSelector = <ValueType>({
  key,
  get,
  areEqual,
}: {
  key: string;
  get: (callbacks: SelectorGetter) => ValueType;
  areEqual?: (previous: ValueType, next: ValueType) => boolean;
}): Selector<ValueType> => {
  const derivedAtom = atom((jotaiGet) => {
    const getHelper = buildGetHelper(jotaiGet);

    return get({ get: getHelper });
  });

  const finalAtom = isDefined(areEqual)
    ? selectAtom(derivedAtom, (value) => value, areEqual)
    : derivedAtom;

  finalAtom.debugLabel = key;

  return {
    type: 'Selector',
    key,
    atom: finalAtom,
  };
};
