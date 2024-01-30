import {
  GetCallback,
  GetRecoilValue,
  Loadable,
  RecoilValue,
  selectorFamily,
  WrappedValue,
} from 'recoil';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

type SelectorGetter<T, P> = (
  param: P,
) => (opts: {
  get: GetRecoilValue;
  getCallback: GetCallback;
}) => Promise<T> | RecoilValue<T> | Loadable<T> | WrappedValue<T> | T;

export const createSelectorReadOnlyScopeMap = <ValueType>({
  key,
  get,
}: {
  key: string;
  get: SelectorGetter<ValueType, StateScopeMapKey>;
}) => {
  return selectorFamily<ValueType, StateScopeMapKey>({
    key,
    get,
  });
};
