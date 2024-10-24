import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { ComponentStateTypeV2 } from '@/ui/utilities/state/component-state/types/ComponentStateTypeV2';
import { RecoilState } from 'recoil';

export type ComponentStateV2<StateType> = {
  type: Extract<ComponentStateTypeV2, 'ComponentState'>;
  key: string;
  atomFamily: (
    componentStateKey: ComponentStateKeyV2,
  ) => RecoilState<StateType>;
};
