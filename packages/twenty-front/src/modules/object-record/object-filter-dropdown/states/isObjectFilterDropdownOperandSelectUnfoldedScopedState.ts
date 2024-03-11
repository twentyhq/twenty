import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isObjectFilterDropdownOperandSelectUnfoldedScopedState =
  createComponentState<boolean>({
    key: 'isObjectFilterDropdownOperandSelectUnfoldedScopedState',
    defaultValue: false,
  });
