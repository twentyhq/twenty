import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const multipleRecordPickerSearchableObjectMetadataItemsComponentState =
  createComponentStateV2<ObjectMetadataItem[]>({
    key: 'multipleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
