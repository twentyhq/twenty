import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSearchInputScopedState =
  createComponentState<string>({
    key: 'objectFilterDropdownSearchInputScopedState',
    defaultValue: '',
  });
