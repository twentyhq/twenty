export const getRecordTitleCellId = (
  recordId: string,
  fieldMetadataId: string,
) => {
  return `${recordId}-${fieldMetadataId}`;
};
