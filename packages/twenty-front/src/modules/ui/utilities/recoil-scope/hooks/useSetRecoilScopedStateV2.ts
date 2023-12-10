import { RecoilState, useSetRecoilState } from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

export const useSetRecoilScopedStateV2 = <StateType>(
  recoilState: (scopedKey: ScopedStateKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useSetRecoilState<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
