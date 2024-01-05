import { RecoilState, useSetRecoilState } from 'recoil';

import { StateScopeMapKey } from '../scopes-internal/types/StateScopeMapKey';

export const useSetRecoilScopedStateV2 = <StateType>(
  recoilState: (scopedKey: StateScopeMapKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useSetRecoilState<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
