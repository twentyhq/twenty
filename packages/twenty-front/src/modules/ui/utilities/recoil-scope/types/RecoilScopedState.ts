import { RecoilState } from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

export type RecoilScopedState<StateType> = (
  scopedKey: ScopedStateKey,
) => RecoilState<StateType>;
