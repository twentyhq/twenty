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

import { FamilyStateScopeMapKey } from '../scopes-internal/types/FamilyStateScopeMapKey';

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

export const createFamilySelectorScopeMap = <
  ValueType,
  FamilyKey extends SerializableParam,
>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, FamilyStateScopeMapKey<FamilyKey>>;
  set: SelectorSetter<ValueType, FamilyStateScopeMapKey<FamilyKey>>;
}) => {
  return selectorFamily<ValueType, FamilyStateScopeMapKey<FamilyKey>>({
    key,
    get,
    set,
  });
};
