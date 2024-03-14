import {
  GetCallback,
  GetRecoilValue,
  Loadable,
  RecoilValue,
  WrappedValue,
} from 'recoil';

export type SelectorGetter<T, P> = (
  param: P,
) => (opts: {
  get: GetRecoilValue;
  getCallback: GetCallback;
}) => Promise<T> | RecoilValue<T> | Loadable<T> | WrappedValue<T> | T;
