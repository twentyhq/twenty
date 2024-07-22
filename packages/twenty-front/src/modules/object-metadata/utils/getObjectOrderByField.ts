import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getOrderByForFieldMetadataType } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { isDefined } from '~/utils/isDefined';

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
