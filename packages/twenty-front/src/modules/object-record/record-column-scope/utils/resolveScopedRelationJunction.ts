import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';

// Undefined for a join object a scope cannot reach through, no junction for a plain relation
export const resolveScopedRelationJunction = ({
  fieldMetadataItem: { settings, relation },
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'settings' | 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): { scopedRelationJunction?: ScopedRelationJunction } | undefined => {
  if (!isDefined(relation)) {
    return {};
  }

  const junctionConfig = resolveJunctionConfig({
    settings,
    relationObjectMetadataId: relation.targetObjectMetadata.id,
    relationTargetFieldMetadataId: relation.targetFieldMetadata.id,
    sourceObjectMetadataId: relation.sourceObjectMetadata.id,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return {};
  }

  if (!isUsableJunctionConfig(junctionConfig)) {
    return undefined;
  }

  const { targetFields, junctionObjectMetadata } = junctionConfig;
  const [targetFieldMetadataItem] = targetFields;

  // A scope reaches the target records through one many-to-one relation of the join object, which a morph is not
  if (
    targetFields.length !== 1 ||
    targetFieldMetadataItem.type !== FieldMetadataType.RELATION ||
    !junctionObjectMetadata.readableFields.some(
      findById(targetFieldMetadataItem.id),
    )
  ) {
    return undefined;
  }

  const targetObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: targetFieldMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(targetObjectMetadataItem)) {
    return undefined;
  }

  return {
    scopedRelationJunction: {
      junctionConfig,
      targetFieldMetadataItem,
      targetObjectMetadataItem,
    },
  };
};
