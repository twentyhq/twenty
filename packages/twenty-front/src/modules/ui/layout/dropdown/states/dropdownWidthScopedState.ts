import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const dropdownWidthScopedState = createStateScopeMap<number | undefined>(
  {
    key: 'dropdownWidthScopedState',
    defaultValue: 160,
  },
);
