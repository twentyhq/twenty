import { FieldMetadataType } from 'twenty-shared/types';
import {
  isFieldMetadataNumericKind,
  isFieldMetadataTextKind,
} from 'twenty-shared/utils';
import {
  type IconComponent,
  IconSortAscending,
  IconSortAscendingLetters,
  IconSortAscendingNumbers,
  IconSortDescending,
  IconSortDescendingLetters,
  IconSortDescendingNumbers,
} from 'twenty-ui/display';
import { GraphOrderBy } from '~/generated/graphql';

export const getSortIconForFieldType = ({
  fieldType,
  orderBy,
}: {
  fieldType: FieldMetadataType | undefined;
  orderBy: GraphOrderBy;
}): IconComponent => {
  const isAscending =
    orderBy === GraphOrderBy.FIELD_ASC ||
    orderBy === GraphOrderBy.FIELD_POSITION_ASC ||
    orderBy === GraphOrderBy.VALUE_ASC;

  const isPositionSort =
    orderBy === GraphOrderBy.FIELD_POSITION_ASC ||
    orderBy === GraphOrderBy.FIELD_POSITION_DESC;

  if (isPositionSort) {
    return isAscending ? IconSortAscending : IconSortDescending;
  }

  if (!fieldType) {
    return isAscending ? IconSortAscending : IconSortDescending;
  }

  if (isFieldMetadataTextKind(fieldType)) {
    return isAscending ? IconSortAscendingLetters : IconSortDescendingLetters;
  }

  if (isFieldMetadataNumericKind(fieldType)) {
    return isAscending ? IconSortAscendingNumbers : IconSortDescendingNumbers;
  }

  if (
    fieldType === FieldMetadataType.SELECT &&
    (orderBy === GraphOrderBy.FIELD_ASC || orderBy === GraphOrderBy.FIELD_DESC)
  ) {
    return isAscending ? IconSortAscendingLetters : IconSortDescendingLetters;
  }

  return isAscending ? IconSortAscending : IconSortDescending;
};
