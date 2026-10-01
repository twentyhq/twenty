import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { getOrderByForRelationField as computeRelationOrderBy } from 'twenty-shared/utils';

export { getOrderByForFieldMetadataType } from 'twenty-shared/utils';

export const getOrderByForRelationField = ({
  field,
  relatedObjectMetadataItem,
  orderByDirection,
}: {
  field: Pick<FieldMetadataItem, 'name'>;
  relatedObjectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >;
  orderByDirection: OrderBy;
}): RecordGqlOperationOrderBy =>
  computeRelationOrderBy({
    field,
    labelIdentifierField: getLabelIdentifierFieldMetadataItem(
      relatedObjectMetadataItem,
    ),
    orderByDirection,
  });
