import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { getPositionBetween } from '~/utils/getPositionBetween';

const RELATION_COLUMN_SIZE = 150;

export type RecordTableRelationColumnTarget = Pick<
  RecordField,
  'relationTargetFieldMetadataId' | 'relationAggregateOperation'
>;

// Goes after the last column of its relation, so columns of one relation stay grouped
export const buildRecordTableRelationColumn = ({
  relationFieldMetadataItemId,
  relationTargetFieldMetadataId = null,
  relationAggregateOperation = null,
  recordFields,
}: {
  relationFieldMetadataItemId: string;
  recordFields: Pick<RecordField, 'fieldMetadataItemId' | 'position'>[];
} & RecordTableRelationColumnTarget): RecordField => {
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
    relationAggregateOperation,
    position: getPositionBetween(
      previousPosition,
      isNonEmptyArray(followingPositions)
        ? Math.min(...followingPositions)
        : undefined,
    ),
    isVisible: true,
    isCanonical: false,
    size: RELATION_COLUMN_SIZE,
  };
};
