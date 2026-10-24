export const getRecordFormFieldInputInstanceId = ({
  formInstanceId,
  fieldMetadataId,
}: {
  formInstanceId: string;
  fieldMetadataId: string;
}) => `record-form-${formInstanceId}-${fieldMetadataId}`;
