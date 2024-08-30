import { RecoilState } from 'recoil';

import { RecoilComponentStateKey } from '@/ui/utilities/state/component-state/types/RecoilComponentStateKey';

export type RecoilScopedState<StateType> = (
  scopedKey: RecoilComponentStateKey,
) => RecoilState<StateType>;
