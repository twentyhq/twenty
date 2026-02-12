export const getDropdownFocusIdForRecordField = ({
  recordId,
  fieldMetadataId,
  componentType,
  instanceId,
}: {
  recordId: string;
  fieldMetadataId: string;
  componentType: 'table-cell' | 'inline-cell';
  instanceId: string;
}) => {
  return `dropdown-${instanceId}-${componentType}-record-${recordId}-field-${fieldMetadataId}`;
};
