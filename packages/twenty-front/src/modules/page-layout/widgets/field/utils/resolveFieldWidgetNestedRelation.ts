import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldWidgetEligibleNestedField } from '@/page-layout/widgets/field/utils/isFieldWidgetEligibleNestedField';
import { isDefined } from 'twenty-shared/utils';

type ResolveFieldWidgetNestedRelationArgs = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  relationTargetObjectMetadataId: string | undefined;
  nestedRelationFieldMetadataId: string | null | undefined;
};

type ResolvedFieldWidgetNestedRelation = {
  nestedRelationFieldMetadataItem: FieldMetadataItem & {
    relation: NonNullable<FieldMetadataItem['relation']>;
  };
  nestedRelationTargetObjectMetadataItem: EnrichedObjectMetadataItem;
};

// Resolves the second hop of a nested relation field widget: the one-to-many
// relation field on the first hop's target object, and the terminal object
// whose records the widget lists. Returns undefined when the chain is broken
// (deleted or deactivated field) so callers can degrade gracefully.
export const resolveFieldWidgetNestedRelation = ({
  objectMetadataItems,
  relationTargetObjectMetadataId,
  nestedRelationFieldMetadataId,
}: ResolveFieldWidgetNestedRelationArgs):
  | ResolvedFieldWidgetNestedRelation
  | undefined => {
  if (
    !isDefined(relationTargetObjectMetadataId) ||
    !isDefined(nestedRelationFieldMetadataId)
  ) {
    return undefined;
  }

  const relationTargetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === relationTargetObjectMetadataId,
  );

  if (!isDefined(relationTargetObjectMetadataItem)) {
    return undefined;
  }

  const nestedRelationFieldMetadataItem =
    relationTargetObjectMetadataItem.readableFields.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id === nestedRelationFieldMetadataId,
    );

  if (
    !isDefined(nestedRelationFieldMetadataItem) ||
    !isFieldWidgetEligibleNestedField(nestedRelationFieldMetadataItem)
  ) {
    return undefined;
  }

  const nestedRelationTargetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id ===
      nestedRelationFieldMetadataItem.relation.targetObjectMetadata.id,
  );

  if (!isDefined(nestedRelationTargetObjectMetadataItem)) {
    return undefined;
  }

  return {
    nestedRelationFieldMetadataItem,
    nestedRelationTargetObjectMetadataItem,
  };
};
