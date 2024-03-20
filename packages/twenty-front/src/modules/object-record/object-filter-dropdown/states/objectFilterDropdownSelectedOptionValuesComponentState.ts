import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSelectedOptionValuesComponentState =
  createComponentState<string[]>({
    key: 'objectFilterDropdownSelectedOptionValuesComponentState',
    defaultValue: [],
  });
