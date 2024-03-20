import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSelectedRecordIdsComponentState =
  createComponentState<string[]>({
    key: 'objectFilterDropdownSelectedRecordIdsComponentState',
    defaultValue: [],
  });
