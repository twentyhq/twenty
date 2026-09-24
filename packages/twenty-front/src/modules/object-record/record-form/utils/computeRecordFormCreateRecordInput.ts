import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { buildMorphRelationUpdateInput } from '@/object-record/record-field/ui/meta-types/input/utils/buildMorphRelationUpdateInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type MorphRelationDraftValue = {
  targetObjectMetadataId: string;
  id: string;
};

const isMorphRelationDraftValue = (
  draftValue: unknown,
): draftValue is MorphRelationDraftValue =>
  isDefined(draftValue) &&
  typeof draftValue === 'object' &&
  'targetObjectMetadataId' in draftValue &&
  isNonEmptyString(draftValue.targetObjectMetadataId) &&
  'id' in draftValue &&
  isNonEmptyString(draftValue.id);

export const computeRecordFormCreateRecordInput = ({
  draftRecord,
  fieldMetadataItems,
  objectMetadataItems,
}: {
  draftRecord: Partial<ObjectRecord>;
  fieldMetadataItems: FieldMetadataItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): Partial<ObjectRecord> => {
  const gqlFieldNamesToOmit = new Set<string>();
  const morphJoinColumnValuesToSet: Record<string, string> = {};

  for (const fieldMetadataItem of fieldMetadataItems) {
    if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
      continue;
    }

    const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

    if (!(gqlFieldName in draftRecord)) {
      continue;
    }

    const draftValue = draftRecord[gqlFieldName];
    const morphRelationType = fieldMetadataItem.morphRelations?.[0]?.type;

    if (!isDefined(morphRelationType)) {
      continue;
    }

    const { updateInput } = buildMorphRelationUpdateInput({
      morphRelations: fieldMetadataItem.morphRelations ?? [],
      fieldName: fieldMetadataItem.name,
      relationType: morphRelationType,
      objectMetadataItems,
      ...(isMorphRelationDraftValue(draftValue)
        ? {
            targetRecordId: draftValue.id,
            targetObjectMetadataId: draftValue.targetObjectMetadataId,
          }
        : {}),
    });

    gqlFieldNamesToOmit.add(gqlFieldName);

    for (const [joinColumnName, joinColumnValue] of Object.entries(
      updateInput,
    )) {
      gqlFieldNamesToOmit.add(joinColumnName);

      if (isDefined(joinColumnValue)) {
        morphJoinColumnValuesToSet[joinColumnName] = joinColumnValue;
      }
    }
  }

  return {
    ...Object.fromEntries(
      Object.entries(draftRecord).filter(
        ([gqlFieldName]) => !gqlFieldNamesToOmit.has(gqlFieldName),
      ),
    ),
    ...morphJoinColumnValuesToSet,
  };
};
