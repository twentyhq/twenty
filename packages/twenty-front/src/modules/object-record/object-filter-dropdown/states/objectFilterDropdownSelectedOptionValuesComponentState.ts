import { createComponentState } from 'twenty-ui';

export const objectFilterDropdownSelectedOptionValuesComponentState =
  createComponentState<string[]>({
    key: 'objectFilterDropdownSelectedOptionValuesComponentState',
    defaultValue: [],
  });
