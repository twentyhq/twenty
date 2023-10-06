import { RecoilState, useRecoilState } from 'recoil';

type ScopedStateKey = {
  scopeId: string;
};

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
