import { RecoilValueReadOnly } from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

export type RecoilScopedSelector<StateType> = (
  scopedKey: ScopedStateKey,
) => RecoilValueReadOnly<StateType>;
