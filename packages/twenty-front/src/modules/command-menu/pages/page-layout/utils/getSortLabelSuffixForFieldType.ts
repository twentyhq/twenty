import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isFieldMetadataNumericKind,
  isFieldMetadataTextKind,
} from 'twenty-shared/utils';

import { GraphOrderBy } from '~/generated/graphql';

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

  if (isFieldMetadataTextKind(fieldType)) {
    return isAscending ? t`alphabetical` : t`reverse alphabetical`;
  }

  if (isFieldMetadataNumericKind(fieldType)) {
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
