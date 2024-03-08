import { RecoilState, SerializableParam, useRecoilState } from 'recoil';

import { ComponentFamilyStateKey } from '@/ui/utilities/state/component-state/types/ComponentFamilyStateKey';

export const useRecoilScopedFamilyState = <
  StateType,
  FamilyKey extends SerializableParam,
>(
  recoilState: (
    scopedFamilyKey: ComponentFamilyStateKey<FamilyKey>,
  ) => RecoilState<StateType>,
  scopeId: string,
  familyKey?: FamilyKey,
) => {
  const familyState = useRecoilState<StateType>(
    recoilState({
      scopeId,
      familyKey: familyKey || ('' as FamilyKey),
    }),
  );

  if (!familyKey) {
    return [undefined, undefined];
  }

  return familyState;
};
