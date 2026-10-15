import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { buildRecordWithAllMorphObjectIdsToNull } from '@/object-record/record-field/ui/meta-types/input/utils/buildRecordWithAllMorphObjectIdsToNull';
import { type RelationType } from 'twenty-shared/types';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';

export const buildMorphRelationUpdateInput = ({
  morphRelations,
  fieldName,
  relationType,
  objectMetadataItems,
  targetRecordId,
  targetObjectMetadataId,
}: {
  morphRelations: FieldMetadataItemRelation[];
  fieldName: string;
  relationType: RelationType;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  targetRecordId?: string;
  targetObjectMetadataId?: string;
}): {
  updateInput: Record<string, string | null>;
  allMorphForeignKeysNulled: Record<string, null>;
} => {
  const allMorphForeignKeysNulled = buildRecordWithAllMorphObjectIdsToNull({
    morphRelations,
    fieldName,
    relationType,
  });

  if (!targetRecordId || !targetObjectMetadataId) {
    return {
      updateInput: { ...allMorphForeignKeysNulled },
      allMorphForeignKeysNulled,
    };
  }

  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) => objectMetadataItem.id === targetObjectMetadataId,
  );

  if (!targetObjectMetadataItem) {
    throw new Error(
      // Error text is used for locale-independent issue grouping.
      // oxlint-disable-next-line lingui/no-unlocalized-strings
      `Target object metadata item not found for id ${targetObjectMetadataId}`,
    );
  }

  const computedFieldName = computeMorphRelationGqlFieldName({
    fieldName,
    relationType,
    targetObjectMetadataNameSingular: targetObjectMetadataItem.nameSingular,
    targetObjectMetadataNamePlural: targetObjectMetadataItem.namePlural,
  });

  const updateInput: Record<string, string | null> = {
    ...allMorphForeignKeysNulled,
    // Metadata and protocol identifiers must stay stable across locales.
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    [`${computedFieldName}Id`]: targetRecordId,
  };

  return { updateInput, allMorphForeignKeysNulled };
};
