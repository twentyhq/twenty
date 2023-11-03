import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const objectFilterDropdownSelectedEntityIdScopedState =
  createScopedState<string | null>({
    key: 'objectFilterDropdownSelectedEntityIdScopedState',
    defaultValue: null,
  });
