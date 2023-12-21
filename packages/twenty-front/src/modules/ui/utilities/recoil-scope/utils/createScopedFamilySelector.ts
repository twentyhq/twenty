import {
  DefaultValue,
  GetCallback,
  GetRecoilValue,
  Loadable,
  RecoilValue,
  ResetRecoilState,
  selectorFamily,
  SerializableParam,
  SetRecoilState,
  WrappedValue,
} from 'recoil';

import { ScopedFamilyStateKey } from '../scopes-internal/types/ScopedFamilyStateKey';

type SelectorGetter<T, P> = (
  param: P,
) => (opts: {
  get: GetRecoilValue;
  getCallback: GetCallback;
}) => Promise<T> | RecoilValue<T> | Loadable<T> | WrappedValue<T> | T;

type SelectorSetter<T, P> = (
  param: P,
) => (
  opts: { set: SetRecoilState; get: GetRecoilValue; reset: ResetRecoilState },
  newValue: T | DefaultValue,
) => void;

export const createScopedFamilySelector = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, ScopedFamilyStateKey<FamilyKey>>;
  set: SelectorSetter<ValueType, ScopedFamilyStateKey<FamilyKey>>;
}) => {
  return selectorFamily<ValueType, ScopedFamilyStateKey<FamilyKey>>({
    key,
    get,
    set,
  });
};
