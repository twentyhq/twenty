import { RecoilState, useRecoilValue } from 'recoil';

import { StateScopeMapKey } from '../scopes-internal/types/StateScopeMapKey';

export const useRecoilScopedValueV2 = <StateType>(
  recoilState: (scopedKey: StateScopeMapKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useRecoilValue<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
