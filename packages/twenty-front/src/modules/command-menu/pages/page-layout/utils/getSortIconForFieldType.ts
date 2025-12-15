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

const TEXT_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.TEXT,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.RICH_TEXT_V2,
];

const NUMBER_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.NUMERIC,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.RATING,
  FieldMetadataType.POSITION,
];

export const getSortIconForFieldType = ({
  fieldType,
  orderBy,
}: {
  fieldType: FieldMetadataType;
  orderBy: GraphOrderBy;
}): IconComponent => {
  const isAscending = orderBy === GraphOrderBy.FIELD_ASC;

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
