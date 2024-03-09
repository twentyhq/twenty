import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isObjectFilterDropdownUnfoldedScopedState =
  createComponentState<boolean>({
    key: 'isObjectFilterDropdownUnfoldedScopedState',
    defaultValue: false,
  });
