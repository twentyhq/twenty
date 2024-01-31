import { RecoilValueReadOnly } from 'recoil';

import { StateScopeMapKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/StateScopeMapKey';

export const getSelectorReadOnly = <StateType>(
  stateScopeMap: (
    stateScopeMapKey: StateScopeMapKey,
  ) => RecoilValueReadOnly<StateType>,
  scopeId: string,
) => {
  return () => stateScopeMap({ scopeId });
};
