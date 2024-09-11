import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { RecoilState } from 'recoil';

export type ComponentSelectorV2<StateType> = {
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKeyV2,
  ) => RecoilState<StateType>;
};
