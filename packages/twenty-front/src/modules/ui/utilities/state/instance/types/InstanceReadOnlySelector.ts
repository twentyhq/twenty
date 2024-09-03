import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';
import { RecoilValueReadOnly } from 'recoil';

export type InstanceReadOnlySelector<StateType> = {
  key: string;
  selectorFamily: (
    instanceStateKey: InstanceStateKey,
  ) => RecoilValueReadOnly<StateType>;
};
