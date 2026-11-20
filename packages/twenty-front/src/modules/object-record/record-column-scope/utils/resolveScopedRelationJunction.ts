import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';

type ScopedRelationJunctionResolution =
  | { status: 'not-a-junction' | 'unsupported'; scopedRelationJunction?: never }
  | { status: 'supported'; scopedRelationJunction: ScopedRelationJunction };

export const resolveScopedRelationJunction = ({
  fieldMetadataItem: { settings, relation },
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<FieldMetadataItem, 'settings' | 'relation'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): ScopedRelationJunctionResolution => {
  if (!isDefined(relation)) {
    return { status: 'not-a-junction' };
  }

  const junctionConfig = resolveJunctionConfig({
    settings,
    relationObjectMetadataId: relation.targetObjectMetadata.id,
    relationTargetFieldMetadataId: relation.targetFieldMetadata.id,
    sourceObjectMetadataId: relation.sourceObjectMetadata.id,
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return { status: 'not-a-junction' };
  }

  if (!isUsableJunctionConfig(junctionConfig)) {
    return { status: 'unsupported' };
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
    return { status: 'unsupported' };
  }

  const targetObjectMetadataItem = findRelationTargetObjectMetadataItem({
    fieldMetadataItem: targetFieldMetadataItem,
    objectMetadataItems,
  });

  if (!isDefined(targetObjectMetadataItem)) {
    return { status: 'unsupported' };
  }

  return {
    status: 'supported',
    scopedRelationJunction: {
      junctionConfig,
      targetFieldMetadataItem,
      targetObjectMetadataItem,
    },
  };
};
