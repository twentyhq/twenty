import { atom } from 'jotai';

import {
  type SelectorGetterV2,
  type SelectorSetterV2,
} from '@/ui/utilities/state/jotai/types/SelectorCallbacksV2';
import { type WritableSelectorV2 } from '@/ui/utilities/state/jotai/types/WritableSelectorV2';
import { buildGetHelper } from '@/ui/utilities/state/jotai/utils/buildGetHelper';
import { buildSetHelper } from '@/ui/utilities/state/jotai/utils/buildSetHelper';

export const createWritableSelectorV2 = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: (callbacks: SelectorGetterV2) => ValueType;
  set: (callbacks: SelectorSetterV2, newValue: ValueType) => void;
}): WritableSelectorV2<ValueType> => {
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
    type: 'WritableSelectorV2',
    key,
    atom: derivedAtom,
  };
};
