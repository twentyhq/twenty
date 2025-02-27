import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectRecordMultiSelectCheckedRecordsIdsComponentState =
  createComponentState<string[]>({
    key: 'objectRecordMultiSelectCheckedRecordsIdsComponentState',
    defaultValue: [],
  });
