import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { v4 } from 'uuid';
import { getPositionBetween } from '~/utils/getPositionBetween';

export const buildRecordTableColumnToAdd = ({
  sourceRecordField,
  recordFields,
}: {
  sourceRecordField: Pick<
    RecordField,
    'position' | 'fieldMetadataItemId' | 'size'
  >;
  recordFields: Pick<RecordField, 'position'>[];
}): RecordField => {
  const followingPositions = recordFields
    .map(({ position }) => position)
    .filter((position) => position > sourceRecordField.position);

  return {
    id: v4(),
    fieldMetadataItemId: sourceRecordField.fieldMetadataItemId,
    position: getPositionBetween(
      sourceRecordField.position,
      followingPositions.length > 0
        ? Math.min(...followingPositions)
        : undefined,
    ),
    isVisible: true,
    isCanonical: false,
    size: sourceRecordField.size,
  };
};
