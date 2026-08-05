import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { isDefined } from 'twenty-shared/utils';

type GetFieldWidgetRelationTraversalArgs = {
  sourceFieldMetadataItem: FieldMetadataItem | undefined;
  nestedRelationFieldMetadataItem?: FieldMetadataItem;
};

type FieldWidgetRelationTraversal = {
  targetObjectMetadataId: string | undefined;
  inverseFieldMetadataId: string | undefined;
  relationTargetFieldMetadataId: string | null;
};

// The widget's embedded view lists records of the last hop's target object,
// scoped back to the current record through that hop's inverse relation. A
// nested widget scopes one relation further out, which the seeded view filter
// expresses as relationTargetFieldMetadataId: the first hop's inverse.
export const getFieldWidgetRelationTraversal = ({
  sourceFieldMetadataItem,
  nestedRelationFieldMetadataItem,
}: GetFieldWidgetRelationTraversalArgs): FieldWidgetRelationTraversal => {
  const lastHopFieldMetadataItem =
    nestedRelationFieldMetadataItem ?? sourceFieldMetadataItem;

  // Only a one-to-many first hop needs the traversal: its intermediate
  // records carry the join column pointing back at the current record. A
  // many-to-one first hop points at a single intermediate record, which the
  // widget supplies as the filter's current record, so the seeded filter
  // stays a direct one.
  const shouldTraverseFirstHop =
    isDefined(nestedRelationFieldMetadataItem) &&
    isDefined(sourceFieldMetadataItem) &&
    isOneToManyRelationField(sourceFieldMetadataItem);

  return {
    targetObjectMetadataId:
      lastHopFieldMetadataItem?.relation?.targetObjectMetadata.id,
    inverseFieldMetadataId:
      lastHopFieldMetadataItem?.relation?.targetFieldMetadata.id,
    relationTargetFieldMetadataId: shouldTraverseFirstHop
      ? (sourceFieldMetadataItem.relation?.targetFieldMetadata.id ?? null)
      : null,
  };
};
