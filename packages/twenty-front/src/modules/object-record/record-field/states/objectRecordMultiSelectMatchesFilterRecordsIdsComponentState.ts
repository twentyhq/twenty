import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectRecordMultiSelectMatchesFilterRecordsIdsComponentState =
  createComponentState<ObjectRecordForSelect[]>({
    key: 'objectRecordMultiSelectMatchesFilterRecordsIdsComponentState',
    defaultValue: [],
  });
