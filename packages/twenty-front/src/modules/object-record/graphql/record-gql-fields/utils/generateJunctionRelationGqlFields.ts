import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/getJunctionConfig';
import { hasJunctionConfig } from '@/object-record/record-field/ui/utils/isJunctionRelation';
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

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(targetObjectMetadata);

  const imageIdentifierFieldMetadataItem =
    getImageIdentifierFieldMetadataItem(targetObjectMetadata);

  return {
    [targetField.name]: {
      id: true,
      ...(isDefined(labelIdentifierFieldMetadataItem)
        ? { [labelIdentifierFieldMetadataItem.name]: true }
        : {}),
      ...(isDefined(imageIdentifierFieldMetadataItem)
        ? { [imageIdentifierFieldMetadataItem.name]: true }
        : {}),
    },
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

    // Compute the actual field name (e.g., "caretakerPerson")
    const computedFieldName = computeMorphRelationFieldName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular: targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
    });

    const labelIdentifierFieldMetadataItem =
      getLabelIdentifierFieldMetadataItem(targetObjectMetadata);

    const imageIdentifierFieldMetadataItem =
      getImageIdentifierFieldMetadataItem(targetObjectMetadata);

    result[computedFieldName] = {
      id: true,
      ...(isDefined(labelIdentifierFieldMetadataItem)
        ? { [labelIdentifierFieldMetadataItem.name]: true }
        : {}),
      ...(isDefined(imageIdentifierFieldMetadataItem)
        ? { [imageIdentifierFieldMetadataItem.name]: true }
        : {}),
    };
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

  let junctionTargetFields: RecordGqlFields = {};

  for (const targetField of targetFields) {
    Object.assign(
      junctionTargetFields,
      buildTargetFieldGqlFields(targetField, objectMetadataItems),
    );
  }

  const junctionLabelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(junctionObjectMetadata);

  return {
    id: true,
    ...(isDefined(junctionLabelIdentifierFieldMetadataItem)
      ? { [junctionLabelIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...junctionTargetFields,
  };
};

// Check if a field is a junction relation (has junction config)
export const isJunctionRelationField = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings'>,
): boolean => {
  if (fieldMetadataItem.type !== FieldMetadataType.RELATION) {
    return false;
  }

  return hasJunctionConfig(fieldMetadataItem.settings);
};
