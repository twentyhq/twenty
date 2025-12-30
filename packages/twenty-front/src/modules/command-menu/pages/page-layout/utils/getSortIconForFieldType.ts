import { NUMBER_FIELD_TYPES } from '@/command-menu/pages/page-layout/utils/number-field-types';
import { TEXT_FIELD_TYPES } from '@/command-menu/pages/page-layout/utils/text-field-types';
import { FieldMetadataType } from 'twenty-shared/types';
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

  if (TEXT_FIELD_TYPES.includes(fieldType)) {
    return isAscending ? IconSortAscendingLetters : IconSortDescendingLetters;
  }

  if (NUMBER_FIELD_TYPES.includes(fieldType)) {
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
