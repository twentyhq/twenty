import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

export const getSortLabelSuffixForFieldType = ({
  fieldType,
  orderBy,
}: {
  fieldType: FieldMetadataType | undefined;
  orderBy: GraphOrderBy;
}): string => {
  const isAscending =
    orderBy === GraphOrderBy.FIELD_ASC ||
    orderBy === GraphOrderBy.FIELD_POSITION_ASC ||
    orderBy === GraphOrderBy.VALUE_ASC;

  if (!isDefined(fieldType)) {
    return isAscending ? t`ascending` : t`descending`;
  }

  if (TEXT_FIELD_TYPES.includes(fieldType)) {
    return isAscending ? t`alphabetical` : t`reverse alphabetical`;
  }

  if (NUMBER_FIELD_TYPES.includes(fieldType)) {
    return isAscending ? t`ascending` : t`descending`;
  }

  if (fieldType === FieldMetadataType.SELECT) {
    if (
      orderBy === GraphOrderBy.FIELD_ASC ||
      orderBy === GraphOrderBy.FIELD_DESC
    ) {
      return isAscending ? t`alphabetical` : t`reverse alphabetical`;
    }

    if (
      orderBy === GraphOrderBy.FIELD_POSITION_ASC ||
      orderBy === GraphOrderBy.FIELD_POSITION_DESC
    ) {
      return isAscending ? t`position ascending` : t`position descending`;
    }

    return isAscending ? t`ascending` : t`descending`;
  }

  return isAscending ? t`ascending` : t`descending`;
};
