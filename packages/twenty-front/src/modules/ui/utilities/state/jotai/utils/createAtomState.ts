import { atom, type WritableAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { isDefined } from 'twenty-shared/utils';

import { type State } from '@/ui/utilities/state/jotai/types/State';
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

type LocalStorageOptions = { getOnInit?: boolean };

// Wraps the default JSON localStorage so a persisted value that fails
// validateInitFn falls back to the initial value instead of hydrating the atom
// with an invalid payload.
const createValidatedLocalStorage = <ValueType>(
  validateInitFn: (payload: NonNullable<ValueType>) => boolean,
) => {
  const storage = createJSONStorage<ValueType>(() => localStorage);

  return {
    ...storage,
    getItem: (key: string, initialValue: ValueType): ValueType => {
      const value = storage.getItem(key, initialValue) as ValueType;

      if (
        isDefined(value) &&
        !validateInitFn(value as NonNullable<ValueType>)
      ) {
        return initialValue;
      }

      return value;
    },
  };
};

export const createAtomState = <ValueType>({
  key,
  defaultValue,
  useLocalStorage = false,
  useSessionStorage = false,
  localStorageOptions,
  validateInitFn,
  useCookieStorage,
}: {
  key: string;
  defaultValue: ValueType;
  useLocalStorage?: boolean;
  useSessionStorage?: boolean;
  localStorageOptions?: LocalStorageOptions;
  validateInitFn?: (payload: NonNullable<ValueType>) => boolean;
  useCookieStorage?: CookieStorageConfig<ValueType>;
}): State<ValueType> => {
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
  } else if (useSessionStorage) {
    const storage = createJSONStorage<ValueType>(() => sessionStorage);
    baseAtom = atomWithStorage<ValueType>(key, defaultValue, storage, {
      getOnInit: true,
    }) as StateAtom<ValueType>;
  } else if (useLocalStorage) {
    const storage = isDefined(validateInitFn)
      ? createValidatedLocalStorage<ValueType>(validateInitFn)
      : undefined;
    baseAtom = atomWithStorage<ValueType>(
      key,
      defaultValue,
      storage,
      localStorageOptions ?? undefined,
    ) as StateAtom<ValueType>;
  } else {
    baseAtom = atom(defaultValue);
  }

  baseAtom.debugLabel = key;

  return {
    type: 'State',
    key,
    atom: baseAtom,
  };
};
