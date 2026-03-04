import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { buildRecordWithAllMorphObjectIdsToNull } from '@/object-record/record-field/ui/meta-types/input/utils/buildRecordWithAllMorphObjectIdsToNull';
import { type RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const buildMorphRelationUpdateInput = ({
  morphRelations,
  fieldName,
  relationType,
  targetObjectMetadataNameSingular,
  targetObjectMetadataNamePlural,
  targetRecordId,
}: {
  morphRelations: FieldMetadataItemRelation[];
  fieldName: string;
  relationType: RelationType;
  targetObjectMetadataNameSingular: string;
  targetObjectMetadataNamePlural: string;
  targetRecordId: string;
}): {
  updateInput: Record<string, string | null>;
  allMorphFksNulled: Record<string, null>;
} => {
  const allMorphFksNulled = buildRecordWithAllMorphObjectIdsToNull({
    morphRelations,
    fieldName,
    relationType,
  });

  const computedFieldName = computeMorphRelationFieldName({
    fieldName,
    relationType,
    targetObjectMetadataNameSingular,
    targetObjectMetadataNamePlural,
  });

  const updateInput: Record<string, string | null> = {
    ...allMorphFksNulled,
    [`${computedFieldName}Id`]: targetRecordId,
  };

  return { updateInput, allMorphFksNulled };
};
