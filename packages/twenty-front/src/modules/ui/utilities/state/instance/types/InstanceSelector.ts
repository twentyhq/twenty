import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';
import { RecoilState } from 'recoil';

export type InstanceSelector<StateType> = {
  key: string;
  selectorFamily: (
    instanceStateKey: InstanceStateKey,
  ) => RecoilState<StateType>;
};
