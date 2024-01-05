import { RecoilState } from 'recoil';

import { StateScopeMapKey } from '../scopes-internal/types/StateScopeMapKey';

export type RecoilScopedState<StateType> = (
  scopedKey: StateScopeMapKey,
) => RecoilState<StateType>;
