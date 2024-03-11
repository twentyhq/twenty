import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectFilterDropdownSelectedRecordIdsScopedState =
  createComponentState<string[]>({
    key: 'objectFilterDropdownSelectedRecordIdsScopedState',
    defaultValue: [],
  });
