import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const multipleRecordPickerSearchableObjectMetadataItemsComponentState =
  createComponentState<ObjectMetadataItem[]>({
    key: 'multipleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
