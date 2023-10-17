import { RecoilState, useRecoilState } from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

export const useRecoilScopedStateV2 = <StateType>(
  recoilState: (scopedKey: ScopedStateKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useRecoilState<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
