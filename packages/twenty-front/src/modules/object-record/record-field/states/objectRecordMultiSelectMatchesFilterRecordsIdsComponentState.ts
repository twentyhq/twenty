import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectRecordMultiSelectMatchesFilterRecordsIdsComponentState =
  createComponentState<ObjectRecordForSelect[]>({
    key: 'objectRecordMultiSelectMatchesFilterRecordsIdsComponentState',
    defaultValue: [],
  });
