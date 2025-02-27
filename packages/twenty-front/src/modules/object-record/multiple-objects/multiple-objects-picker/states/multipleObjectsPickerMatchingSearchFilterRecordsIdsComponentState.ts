import { MultipleObjectsPickerComponentInstanceContext } from '@/object-record/multiple-objects/multiple-objects-picker/states/contexts/MultipleObjectsPickerComponentInstanceContext';
import { ObjectRecordForSelect } from '@/object-record/types/ObjectRecordForSelect';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState =
  createComponentStateV2<ObjectRecordForSelect[]>({
    key: 'multipleObjectsPickerMatchingSearchFilterRecordsIdsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleObjectsPickerComponentInstanceContext,
  });
