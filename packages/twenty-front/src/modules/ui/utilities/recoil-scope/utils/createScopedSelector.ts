import {
  GetCallback,
  GetRecoilValue,
  Loadable,
  RecoilValue,
  selectorFamily,
  WrappedValue,
} from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

type SelectorGetter<T, P> = (
  param: P,
) => (opts: {
  get: GetRecoilValue;
  getCallback: GetCallback;
}) => Promise<T> | RecoilValue<T> | Loadable<T> | WrappedValue<T> | T;

export const createScopedSelector = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: SelectorGetter<ValueType, ScopedStateKey>;
}) => {
  return selectorFamily<ValueType, ScopedStateKey>({
    key,
    get,
  });
};
