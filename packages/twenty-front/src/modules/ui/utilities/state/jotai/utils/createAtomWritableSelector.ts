import { atom } from 'jotai';

import {
  type SelectorGetter,
  type SelectorSetter,
} from '@/ui/utilities/state/jotai/types/SelectorCallbacks';
import { type WritableSelector } from '@/ui/utilities/state/jotai/types/WritableSelector';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { buildSetHelper } from '@/ui/utilities/state/jotai/utils/buildSetHelper';

export const createAtomWritableSelector = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: (callbacks: SelectorGetter) => ValueType;
  set: (callbacks: SelectorSetter, newValue: ValueType) => void;
}): WritableSelector<ValueType> => {
  const derivedAtom = atom(
    (jotaiGet) => {
      const getHelper = buildGetHelper(jotaiGet);

      return get({ get: getHelper });
    },
    (
      jotaiGet,
      jotaiSet,
      valueOrUpdater: ValueType | ((prev: ValueType) => ValueType),
    ) => {
      const getHelper = buildGetHelper(jotaiGet);
      const setHelper = buildSetHelper(jotaiSet);

      const resolvedValue =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: ValueType) => ValueType)(
              get({ get: getHelper }),
            )
          : valueOrUpdater;

      set({ get: getHelper, set: setHelper }, resolvedValue);
    },
  );

  derivedAtom.debugLabel = key;

  return {
    type: 'WritableSelector',
    key,
    atom: derivedAtom,
  };
};
