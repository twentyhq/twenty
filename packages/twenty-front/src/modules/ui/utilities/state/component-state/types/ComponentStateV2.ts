import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { RecoilState } from 'recoil';

export type ComponentStateV2<StateType> = {
  key: string;
  atomFamily: (
    componentStateKey: ComponentStateKeyV2,
  ) => RecoilState<StateType>;
};
