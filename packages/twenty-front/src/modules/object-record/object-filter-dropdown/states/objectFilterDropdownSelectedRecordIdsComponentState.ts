import { createComponentState } from 'twenty-ui';

export const objectFilterDropdownSelectedRecordIdsComponentState =
  createComponentState<string[]>({
    key: 'objectFilterDropdownSelectedRecordIdsComponentState',
    defaultValue: [],
  });
