import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

type GenerateRecordGqlFieldsFromRecordInputArgs = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'id' | 'fields' | 'labelIdentifierFieldMetadataId' | 'nameSingular'
  >[];
  objectMetadataItem: Pick<ObjectMetadataItem, 'fields'>;
  recordInput: Record<string, unknown>;
};

type JoinColumnToFieldMap = Map<string, FieldMetadataItem>;

// Build a map of joinColumnName -> fieldMetadata for quick FK lookup
const buildJoinColumnToFieldMap = (
  fields: FieldMetadataItem[],
): JoinColumnToFieldMap => {
  const map: JoinColumnToFieldMap = new Map();

  for (const field of fields) {
    const isRelationOrMorph =
      field.type === FieldMetadataType.RELATION ||
      field.type === FieldMetadataType.MORPH_RELATION;

    if (!isRelationOrMorph) {
      continue;
    }

    const joinColumnName = field.settings?.joinColumnName;

    if (isDefined(joinColumnName)) {
      map.set(joinColumnName, field);
    }
  }

  return map;
};

// Generates minimal GQL fields based only on the input keys being updated
// This reduces the response payload by only requesting the fields that were actually changed
export const generateRecordGqlFieldsFromRecordInput = ({
  objectMetadataItems,
  objectMetadataItem,
  recordInput,
}: GenerateRecordGqlFieldsFromRecordInputArgs): RecordGqlFields => {
  const inputKeys = Object.keys(recordInput);
  const joinColumnToFieldMap = buildJoinColumnToFieldMap(
    objectMetadataItem.fields,
  );

  const recordGqlFields: RecordGqlFields = {
    id: true,
  };

  for (const inputKey of inputKeys) {
    if (inputKey === 'id') {
      continue;
    }

    // Check if this input key is a FK field using the metadata map
    const relationFieldFromJoinColumn = joinColumnToFieldMap.get(inputKey);

    if (isDefined(relationFieldFromJoinColumn)) {
      // This is a FK field (joinColumnName), include it directly
      recordGqlFields[inputKey] = true;
      continue;
    }

    // Find the field metadata for this input key by name
    const fieldMetadata = objectMetadataItem.fields.find(
      (field) => field.name === inputKey,
    );

    if (!isDefined(fieldMetadata)) {
      recordGqlFields[inputKey] = true;
      continue;
    }

    const isRelation = fieldMetadata.type === FieldMetadataType.RELATION;
    const isMorphRelation =
      fieldMetadata.type === FieldMetadataType.MORPH_RELATION;
    const relationType = fieldMetadata.settings?.relationType;
    const joinColumnName = fieldMetadata.settings?.joinColumnName;

    if (isRelation) {
      // For many-to-one relations, include the FK field using joinColumnName from metadata
      if (
        relationType === RelationType.MANY_TO_ONE &&
        isDefined(joinColumnName)
      ) {
        recordGqlFields[joinColumnName] = true;
      }

      // Include identifier fields for the relation object
      const relationIdentifierSubGqlFields = getRelationIdentifierSubGqlFields(
        objectMetadataItems,
        fieldMetadata,
      );

      if (isDefined(relationIdentifierSubGqlFields)) {
        recordGqlFields[fieldMetadata.name] = relationIdentifierSubGqlFields;
      }
    } else if (isMorphRelation) {
      if (!isDefined(fieldMetadata.morphRelations)) {
        recordGqlFields[inputKey] = true;
        continue;
      }

      // For morph relations, check if the input key matches any of the computed field names
      for (const morphRelation of fieldMetadata.morphRelations) {
        const morphFieldName = computeMorphRelationFieldName({
          fieldName: fieldMetadata.name,
          relationType: morphRelation.type,
          targetObjectMetadataNameSingular:
            morphRelation.targetObjectMetadata.nameSingular,
          targetObjectMetadataNamePlural:
            morphRelation.targetObjectMetadata.namePlural,
        });

        if (inputKey === morphFieldName) {
          recordGqlFields[morphFieldName] = { id: true, name: true };
        }
      }
    } else {
      recordGqlFields[inputKey] = true;
    }
  }

  return recordGqlFields;
};

const getRelationIdentifierSubGqlFields = (
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'id' | 'fields' | 'labelIdentifierFieldMetadataId' | 'nameSingular'
  >[],
  fieldMetadata: Pick<FieldMetadataItem, 'relation'>,
): RecordGqlFields | undefined => {
  const targetObjectMetadataItem = objectMetadataItems.find(
    (objectMetadataItem) =>
      objectMetadataItem.id === fieldMetadata.relation?.targetObjectMetadata.id,
  );

  if (!targetObjectMetadataItem) {
    return undefined;
  }

  const labelIdentifierFieldMetadataItem = getLabelIdentifierFieldMetadataItem(
    targetObjectMetadataItem,
  );

  const imageIdentifierFieldMetadataItem = getImageIdentifierFieldMetadataItem(
    targetObjectMetadataItem,
  );

  return {
    id: true,
    ...(isDefined(labelIdentifierFieldMetadataItem)
      ? { [labelIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...(isDefined(imageIdentifierFieldMetadataItem)
      ? { [imageIdentifierFieldMetadataItem.name]: true }
      : {}),
  };
};
