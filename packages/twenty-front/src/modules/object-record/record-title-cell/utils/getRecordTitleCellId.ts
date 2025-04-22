import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';

export const getRecordTitleCellId = (
  recordId: string,
  fieldMetadataId: string,
  containerType: RecordTitleCellContainerType,
) => {
  return `${recordId}-${fieldMetadataId}-${containerType}`;
};
