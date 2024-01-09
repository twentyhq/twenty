import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const objectFilterDropdownSelectedEntityIdScopedState =
  createStateScopeMap<string | null>({
    key: 'objectFilterDropdownSelectedEntityIdScopedState',
    defaultValue: null,
  });
