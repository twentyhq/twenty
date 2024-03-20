import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isObjectFilterDropdownOperandSelectUnfoldedComponentState =
  createComponentState<boolean>({
    key: 'isObjectFilterDropdownOperandSelectUnfoldedComponentState',
    defaultValue: false,
  });
