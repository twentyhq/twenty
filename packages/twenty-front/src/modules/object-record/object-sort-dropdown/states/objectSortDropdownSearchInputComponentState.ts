import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectSortDropdownSearchInputComponentState =
  createComponentState<string>({
    key: 'objectSortDropdownSearchInputComponentState',
    defaultValue: '',
  });
