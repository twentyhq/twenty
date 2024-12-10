export const getDropdownFocusIdForRecordField = (
  recordId: string,
  fieldMetadataId: string,
  componentType: 'table-cell' | 'inline-cell',
) => {
  return `dropdown-${componentType}-record-${recordId}-field-${fieldMetadataId}`;
};
