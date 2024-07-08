import { RecoilState } from 'recoil';

import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';

export type ComponentState<StateType> = {
  key: string;
  atomFamily: (componentStateKey: ComponentStateKey) => RecoilState<StateType>;
};
