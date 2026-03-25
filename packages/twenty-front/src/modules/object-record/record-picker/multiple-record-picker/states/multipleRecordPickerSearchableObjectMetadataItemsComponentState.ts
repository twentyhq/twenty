import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const multipleRecordPickerSearchableObjectMetadataItemsComponentState =
  createAtomComponentState<EnrichedObjectMetadataItem[]>({
    key: 'multipleRecordPickerSearchableObjectMetadataItemsComponentState',
    defaultValue: [],
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
