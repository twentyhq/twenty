export const getRecordFormFieldInputInstanceId = ({
  formInstanceId,
  fieldMetadataId,
}: {
  formInstanceId: string;
  fieldMetadataId: string;
}) => `${formInstanceId}-${fieldMetadataId}`;
