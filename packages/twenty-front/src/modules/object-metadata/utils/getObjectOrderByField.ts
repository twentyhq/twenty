import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getOrderByForFieldMetadataType } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { type OrderBy } from '@/types/OrderBy';
import { isDefined } from 'twenty-shared/utils';

export const getOrderByFieldForObjectMetadataItem = (
  objectMetadataItem: ObjectMetadataItem,
  orderBy?: OrderBy | null,
): RecordGqlOperationOrderBy => {
  const labelIdentifierFieldMetadata =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  if (isDefined(labelIdentifierFieldMetadata)) {
    return getOrderByForFieldMetadataType(
      labelIdentifierFieldMetadata,
      orderBy,
    );
  } else {
    return [
      {
        createdAt: orderBy ?? 'DescNullsLast',
      },
    ];
  }
};
