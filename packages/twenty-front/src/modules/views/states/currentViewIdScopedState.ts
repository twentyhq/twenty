import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const currentViewIdScopedState = createStateScopeMap<string | undefined>(
  {
    key: 'currentViewIdScopedState',
    defaultValue: undefined,
  },
);
