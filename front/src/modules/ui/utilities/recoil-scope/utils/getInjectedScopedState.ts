import { RecoilState } from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

export const getInjectedScopedState = <StateType>(
  recoilState: (scopedKey: ScopedStateKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return recoilState({
    scopeId,
  });
};
