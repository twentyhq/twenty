import { RecoilValueReadOnly } from 'recoil';

import { StateScopeMapKey } from '../scopes-internal/types/StateScopeMapKey';

export type RecoilScopedSelector<StateType> = (
  scopedKey: StateScopeMapKey,
) => RecoilValueReadOnly<StateType>;
