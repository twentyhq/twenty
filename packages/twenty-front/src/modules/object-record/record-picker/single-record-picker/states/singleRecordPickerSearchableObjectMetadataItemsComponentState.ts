import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const singleRecordPickerSearchableObjectMetadataItemsComponentState =
  createComponentStateV2<ObjectMetadataItem[]>({
    key: 'singleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
