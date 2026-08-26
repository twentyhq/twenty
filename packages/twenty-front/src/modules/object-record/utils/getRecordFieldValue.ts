const hasField = <FieldName extends string>(
  record: object,
  fieldName: FieldName,
): record is Record<FieldName, unknown> => fieldName in record;

export const getRecordFieldValue = ({
  record,
  fieldName,
}: {
  record: object | null | undefined;
  fieldName: string;
}): unknown =>
  record !== null && record !== undefined && hasField(record, fieldName)
    ? record[fieldName]
    : undefined;
