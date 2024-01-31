import {
  DefaultValue,
  GetCallback,
  GetRecoilValue,
  Loadable,
  RecoilValue,
  ResetRecoilState,
  selectorFamily,
  SetRecoilState,
  WrappedValue,
} from 'recoil';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

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

export const createSelectorScopeMap = <ValueType>({
  key,
  get,
  set,
}: {
  key: string;
  get: SelectorGetter<ValueType, StateScopeMapKey>;
  set: SelectorSetter<ValueType, StateScopeMapKey>;
}) => {
  return selectorFamily<ValueType, StateScopeMapKey>({
    key,
    get,
    set,
  });
};
