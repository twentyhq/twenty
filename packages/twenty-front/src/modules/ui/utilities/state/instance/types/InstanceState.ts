import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';
import { RecoilState } from 'recoil';

export type InstanceState<StateType> = {
  key: string;
  atomFamily: (instanceStateKey: InstanceStateKey) => RecoilState<StateType>;
};
