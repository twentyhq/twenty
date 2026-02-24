import { atom, type WritableAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { isDefined } from 'twenty-shared/utils';

import { type StateV2 } from '@/ui/utilities/state/jotai/types/StateV2';
import { createJotaiCookieStorage } from '@/ui/utilities/state/jotai/utils/createJotaiCookieStorage';

type CookieStorageConfig<ValueType> = {
  cookieKey: string;
  attributes?: {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
  };
  validateInitFn?: (payload: NonNullable<ValueType>) => boolean;
};

type StateAtom<ValueType> = WritableAtom<
  ValueType,
  [ValueType | ((prev: ValueType) => ValueType)],
  void
>;

export const createStateV2 = <ValueType>({
  key,
  defaultValue,
  useLocalStorage = false,
  useCookieStorage,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
  useCookieStorage?: CookieStorageConfig<ValueType>;
}): StateV2<ValueType> => {
  let baseAtom: StateAtom<ValueType>;

  if (isDefined(useCookieStorage)) {
    const storage = createJotaiCookieStorage<ValueType>({
      cookieKey: useCookieStorage.cookieKey,
      attributes: useCookieStorage.attributes,
      validateInitFn: useCookieStorage.validateInitFn,
    });
    baseAtom = atomWithStorage<ValueType>(
      useCookieStorage.cookieKey,
      defaultValue,
      storage,
      { getOnInit: true },
    ) as StateAtom<ValueType>;
  } else if (useLocalStorage) {
    baseAtom = atomWithStorage<ValueType>(
      key,
      defaultValue,
    ) as StateAtom<ValueType>;
  } else {
    baseAtom = atom(defaultValue);
  }

  baseAtom.debugLabel = key;

  return {
    type: 'StateV2',
    key,
    atom: baseAtom,
  };
};
