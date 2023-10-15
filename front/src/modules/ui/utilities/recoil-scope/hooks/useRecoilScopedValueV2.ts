import { RecoilState, useRecoilValue } from 'recoil';

import { ScopedStateKey } from '../scopes-internal/types/ScopedStateKey';

export const useRecoilScopedValueV2 = <StateType>(
  recoilState: (scopedKey: ScopedStateKey) => RecoilState<StateType>,
  scopeId: string,
) => {
  return useRecoilValue<StateType>(
    recoilState({
      scopeId,
    }),
  );
};
