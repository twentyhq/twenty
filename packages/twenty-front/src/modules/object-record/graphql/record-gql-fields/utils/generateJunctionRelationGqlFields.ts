import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

type GenerateJunctionRelationGqlFieldsArgs = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
};

// Build GraphQL fields for a regular RELATION target field
const buildRegularTargetFieldGqlFields = (
  targetField: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): RecordGqlFields => {
  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.id === targetField.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(targetObjectMetadata)) {
    return {};
  }

  return {
    [targetField.name]: buildIdentifierGqlFields(targetObjectMetadata),
  };
};

// Build GraphQL fields for a MORPH_RELATION target field
// Generates fields for each morph relation entry (e.g., caretakerPerson, caretakerCompany)
const buildMorphTargetFieldGqlFields = (
  targetField: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): RecordGqlFields => {
  const morphRelations = targetField.morphRelations;

  if (!Array.isArray(morphRelations) || morphRelations.length === 0) {
    return {};
  }

  const result: RecordGqlFields = {};

  for (const morphRelation of morphRelations) {
    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === morphRelation.targetObjectMetadata.id,
    );

    if (!isDefined(targetObjectMetadata)) {
      continue;
    }

    const computedFieldName = computeMorphRelationFieldName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular: targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
    });

    result[computedFieldName] = buildIdentifierGqlFields(targetObjectMetadata);
  }

  return result;
};

// Build GraphQL fields for a target field (works for both RELATION and MORPH_RELATION)
const buildTargetFieldGqlFields = (
  targetField: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): RecordGqlFields => {
  if (targetField.type === FieldMetadataType.MORPH_RELATION) {
    return buildMorphTargetFieldGqlFields(targetField, objectMetadataItems);
  }
  return buildRegularTargetFieldGqlFields(targetField, objectMetadataItems);
};

// Generates GraphQL fields for a junction relation, including the nested target objects
export const generateJunctionRelationGqlFields = ({
  fieldMetadataItem,
  objectMetadataItems,
}: GenerateJunctionRelationGqlFieldsArgs): RecordGqlFields | null => {
  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId:
      fieldMetadataItem.relation?.targetObjectMetadata.id ?? '',
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return null;
  }

  const { junctionObjectMetadata, targetFields } = junctionConfig;

  const junctionTargetFields = targetFields.reduce<RecordGqlFields>(
    (acc, targetField) => ({
      ...acc,
      ...buildTargetFieldGqlFields(targetField, objectMetadataItems),
    }),
    {},
  );

  return {
    ...buildIdentifierGqlFields(junctionObjectMetadata),
    ...junctionTargetFields,
  };
};
