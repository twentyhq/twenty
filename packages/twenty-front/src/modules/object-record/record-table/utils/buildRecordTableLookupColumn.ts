import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { getPositionBetween } from '~/utils/getPositionBetween';

const LOOKUP_COLUMN_SIZE = 150;

// Goes after the last column of its relation, so lookups of one relation stay grouped
export const buildRecordTableLookupColumn = ({
  relationFieldMetadataItemId,
  relationTargetFieldMetadataId,
  recordFields,
}: {
  relationFieldMetadataItemId: string;
  relationTargetFieldMetadataId: string;
  recordFields: Pick<RecordField, 'fieldMetadataItemId' | 'position'>[];
}): RecordField => {
  const positions = recordFields.map(({ position }) => position);
  const relationPositions = recordFields
    .filter(
      ({ fieldMetadataItemId }) =>
        fieldMetadataItemId === relationFieldMetadataItemId,
    )
    .map(({ position }) => position);
  const anchorPositions = isNonEmptyArray(relationPositions)
    ? relationPositions
    : positions;

  const previousPosition = isNonEmptyArray(anchorPositions)
    ? Math.max(...anchorPositions)
    : undefined;
  const followingPositions = isDefined(previousPosition)
    ? positions.filter((position) => position > previousPosition)
    : [];

  return {
    id: v4(),
    fieldMetadataItemId: relationFieldMetadataItemId,
    relationTargetFieldMetadataId,
    position: getPositionBetween(
      previousPosition,
      isNonEmptyArray(followingPositions)
        ? Math.min(...followingPositions)
        : undefined,
    ),
    isVisible: true,
    isCanonical: false,
    size: LOOKUP_COLUMN_SIZE,
  };
};
