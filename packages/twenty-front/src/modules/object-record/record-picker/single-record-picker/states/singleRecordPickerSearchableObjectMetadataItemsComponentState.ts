import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const singleRecordPickerSearchableObjectMetadataItemsComponentState =
  createAtomComponentState<ObjectMetadataItem[]>({
    key: 'singleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: SingleRecordPickerComponentInstanceContext,
  });
