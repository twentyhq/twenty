import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSelectedEntityIdScopedState =
  createComponentState<string | null>({
    key: 'objectFilterDropdownSelectedEntityIdScopedState',
    defaultValue: null,
  });
