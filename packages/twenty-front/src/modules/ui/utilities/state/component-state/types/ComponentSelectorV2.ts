import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { ComponentStateTypeV2 } from '@/ui/utilities/state/component-state/types/ComponentStateTypeV2';
import { RecoilState } from 'recoil';

export type ComponentSelectorV2<StateType> = {
  type: Extract<ComponentStateTypeV2, 'ComponentSelector'>;
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKeyV2,
  ) => RecoilState<StateType>;
};
