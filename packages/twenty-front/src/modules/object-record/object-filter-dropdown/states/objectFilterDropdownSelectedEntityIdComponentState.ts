import { createComponentState } from 'twenty-ui';

export const objectFilterDropdownSelectedEntityIdComponentState =
  createComponentState<string | null>({
    key: 'objectFilterDropdownSelectedEntityIdComponentState',
    defaultValue: null,
  });
