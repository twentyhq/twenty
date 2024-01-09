import { RecoilState, useRecoilState } from 'recoil';

import { StateScopeMapKey } from '../scopes-internal/types/StateScopeMapKey';

export const useRecoilScopedStateV2 = <StateType>(
  recoilState: (scopedKey: StateScopeMapKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useRecoilState<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
