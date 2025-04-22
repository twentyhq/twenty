export const getRecordTitleCellId = (
  recordId: string,
  fieldMetadataId: string,
  containerType: 'page-header' | 'show-page',
) => {
  return `${recordId}-${fieldMetadataId}-${containerType}`;
};
