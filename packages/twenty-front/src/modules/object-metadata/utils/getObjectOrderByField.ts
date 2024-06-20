import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const getOrderByFieldForObjectMetadataItem = (
  objectMetadataItem: ObjectMetadataItem,
  orderBy?: OrderBy | null,
): RecordGqlOperationOrderBy => {
  const labelIdentifierFieldMetadata =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  if (isDefined(labelIdentifierFieldMetadata)) {
    switch (labelIdentifierFieldMetadata.type) {
      case FieldMetadataType.FullName:
        return [
          {
            [labelIdentifierFieldMetadata.name]: {
              firstName: orderBy ?? 'AscNullsLast',
              lastName: orderBy ?? 'AscNullsLast',
            },
          },
        ];
      default:
        return [
          {
            [labelIdentifierFieldMetadata.name]: orderBy ?? 'AscNullsLast',
          },
        ];
    }
  } else {
    return [
      {
        createdAt: orderBy ?? 'DescNullsLast',
      },
    ];
  }
};
