import { type RecordField } from '@/object-record/record-field/types/RecordField';

export const computeInsertedRecordFieldPosition = ({
  recordFields,
  afterRecordField,
}: {
  recordFields: Pick<RecordField, 'position'>[];
  afterRecordField: Pick<RecordField, 'position'>;
}) => {
  const followingPositions = recordFields
    .map(({ position }) => position)
    .filter((position) => position > afterRecordField.position);

  if (followingPositions.length === 0) {
    return afterRecordField.position + 1;
  }

  return (afterRecordField.position + Math.min(...followingPositions)) / 2;
};
