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
  const createRecordInput: Partial<ObjectRecord> = { ...draftRecord };

  for (const fieldMetadataItem of fieldMetadataItems) {
    if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
      continue;
    }

    const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

    if (!(gqlFieldName in createRecordInput)) {
      continue;
    }

    const draftValue = createRecordInput[gqlFieldName];

    delete createRecordInput[gqlFieldName];

    const morphRelationType = fieldMetadataItem.morphRelations?.[0]?.type;

    if (
      !isMorphRelationDraftValue(draftValue) ||
      !isDefined(morphRelationType)
    ) {
      continue;
    }

    const { updateInput } = buildMorphRelationUpdateInput({
      morphRelations: fieldMetadataItem.morphRelations ?? [],
      fieldName: fieldMetadataItem.name,
      relationType: morphRelationType,
      objectMetadataItems,
      targetRecordId: draftValue.id,
      targetObjectMetadataId: draftValue.targetObjectMetadataId,
    });

    for (const [joinColumnName, joinColumnValue] of Object.entries(
      updateInput,
    )) {
      if (isDefined(joinColumnValue)) {
        createRecordInput[joinColumnName] = joinColumnValue;
      }
    }
  }

  return createRecordInput;
};
