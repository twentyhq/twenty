import { ObjectRecordForSelect } from '@/object-record/record-field/meta-types/input/components/RelationFromManyFieldInputMultiRecordsEffect';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const objectRecordMultiSelectMatchesFilterRecordsIdsComponentState =
  createComponentState<ObjectRecordForSelect[]>({
    key: 'objectRecordMultiSelectMatchesFilterRecordsIdsComponentState',
    defaultValue: [],
  });
