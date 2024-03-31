import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isObjectFilterDropdownUnfoldedComponentState =
  createComponentState<boolean>({
    key: 'isObjectFilterDropdownUnfoldedScopedState',
    defaultValue: false,
  });
