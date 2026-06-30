import { useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId } from '@/object-record/record-picker/hooks/useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId';
import { MultipleRecordPickerMenuItemContent } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItemContent';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { isDefined } from 'twenty-shared/utils';

type MultipleRecordPickerMenuItemProps = {
  recordId: string;
  onChange: (morphItem: RecordPickerPickableMorphItem) => void;
};

export const MultipleRecordPickerMenuItem = ({
  recordId,
  onChange,
}: MultipleRecordPickerMenuItemProps) => {
  const { searchRecord, objectMetadataItem } =
    useRecordPickerGetSearchRecordAndObjectMetadataItemFromRecordId({
      recordId,
    });

  if (!isDefined(searchRecord) || !isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <MultipleRecordPickerMenuItemContent
      searchRecord={searchRecord}
      objectMetadataItem={objectMetadataItem}
      onChange={onChange}
    />
  );
};
