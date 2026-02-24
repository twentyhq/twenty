import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const singleRecordPickerSearchableObjectMetadataItemsComponentState =
  createComponentState<ObjectMetadataItem[]>({
    key: 'singleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
