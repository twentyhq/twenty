import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const singleRecordPickerSearchableObjectMetadataItemsComponentState =
  createComponentState<ObjectMetadataItem[]>({
    key: 'singleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
