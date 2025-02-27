import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState =
  createComponentStateV2<ObjectRecordForSelect[]>({
    key: 'multipleRecordPickerMatchingSearchFilterRecordsIdsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
