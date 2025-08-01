export const isRecordFieldReadOnly = ({
  isRecordDeleted,
  isRecordReadOnly,
  isFieldReadOnly,
}: {
  isRecordDeleted?: boolean;
  isRecordReadOnly?: boolean;
  isFieldReadOnly?: boolean;
}) => {
  return (isRecordDeleted || isRecordReadOnly || isFieldReadOnly) ?? false;
};
