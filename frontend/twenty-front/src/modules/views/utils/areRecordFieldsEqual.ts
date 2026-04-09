import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { compareStrictlyExceptForNullAndUndefined } from '~/utils/compareStrictlyExceptForNullAndUndefined';

export const areRecordFieldsEqual = (
  recordFieldA: RecordField,
  recordFieldB: RecordField,
) => {
  const propertiesToCompare: (keyof RecordField)[] = [
    'fieldMetadataItemId',
    'isVisible',
    'position',
    'size',
    'aggregateOperation',
  ];

  return propertiesToCompare.every((property) =>
    compareStrictlyExceptForNullAndUndefined(
      recordFieldA[property],
      recordFieldB[property],
    ),
  );
};
