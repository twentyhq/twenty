import { ComponentStateKeyV2 } from '@/ui/utilities/state/instance/types/ComponentStateKeyV2';
import { RecoilValueReadOnly } from 'recoil';

export type ComponentReadOnlySelectorV2<StateType> = {
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKeyV2,
  ) => RecoilValueReadOnly<StateType>;
};
