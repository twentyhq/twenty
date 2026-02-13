import { atom } from 'jotai';

import { type SelectorGetterV2 } from '@/ui/utilities/state/jotai/types/SelectorCallbacksV2';
import { type SelectorV2 } from '@/ui/utilities/state/jotai/types/SelectorV2';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';

export const createSelectorV2 = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: (callbacks: SelectorGetterV2) => ValueType;
}): SelectorV2<ValueType> => {
  const derivedAtom = atom((jotaiGet) => {
    const getHelper = buildGetHelper(jotaiGet);

    return get({ get: getHelper });
  });

  derivedAtom.debugLabel = key;

  return {
    type: 'SelectorV2',
    key,
    atom: derivedAtom,
  };
};
