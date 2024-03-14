import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSelectedOptionValuesScopedState =
  createComponentState<string[]>({
    key: 'objectFilterDropdownSelectedOptionValuesScopedState',
    defaultValue: [],
  });
