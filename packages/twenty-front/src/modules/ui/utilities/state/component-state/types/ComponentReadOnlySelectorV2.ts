import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { ComponentStateTypeV2 } from '@/ui/utilities/state/component-state/types/ComponentStateTypeV2';
import { RecoilValueReadOnly } from 'recoil';

export type ComponentReadOnlySelectorV2<StateType> = {
  type: Extract<ComponentStateTypeV2, 'ComponentReadOnlySelector'>;
  key: string;
  selectorFamily: (
    componentStateKey: ComponentStateKeyV2,
  ) => RecoilValueReadOnly<StateType>;
};
