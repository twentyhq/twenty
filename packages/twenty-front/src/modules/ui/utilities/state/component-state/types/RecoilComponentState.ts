import { RecoilState } from 'recoil';
import { RecoilComponentStateKey } from './RecoilComponentStateKey';

export type RecoilComponentState<StateType> = {
  key: string;
  atomFamily: (
    componentStateKey: RecoilComponentStateKey,
  ) => RecoilState<StateType>;
};
