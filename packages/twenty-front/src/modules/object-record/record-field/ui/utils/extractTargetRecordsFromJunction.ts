import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type ExtractedTargetRecord = {
  recordId: string;
  objectMetadataId: string;
  record?: ObjectRecord;
};

type ExtractTargetRecordsFromJunctionArgs = {
  junctionRecords: ObjectRecord[] | undefined | null;
  targetFields: FieldMetadataItem[];
  objectMetadataItems: ObjectMetadataItem[];
  includeRecord?: boolean;
};

export const extractTargetRecordsFromJunction = ({
  junctionRecords,
  targetFields,
  objectMetadataItems,
  includeRecord = false,
}: ExtractTargetRecordsFromJunctionArgs): ExtractedTargetRecord[] => {
  if (!isDefined(junctionRecords) || !Array.isArray(junctionRecords)) {
    return [];
  }

  if (targetFields.length === 0) {
    return [];
  }

  const extractedRecords: ExtractedTargetRecord[] = [];

  for (const junctionRecord of junctionRecords) {
    if (!isDefined(junctionRecord)) {
      continue;
    }

    const extracted = extractFromTargetFields(
      junctionRecord,
      targetFields,
      objectMetadataItems,
      includeRecord,
    );

    if (isDefined(extracted)) {
      extractedRecords.push(extracted);
    }
  }

  return extractedRecords;
};

// Extract target record from junction by checking each target field
const extractFromTargetFields = (
  junctionRecord: ObjectRecord,
  targetFields: FieldMetadataItem[],
  objectMetadataItems: ObjectMetadataItem[],
  includeRecord: boolean,
): ExtractedTargetRecord | null => {
  for (const targetField of targetFields) {
    // For MORPH_RELATION fields, we need to check each morphRelation entry
    // because the actual field names in the record are computed (e.g., "caretakerPerson", "caretakerCompany")
    if (targetField.type === FieldMetadataType.MORPH_RELATION) {
      const result = extractFromMorphRelationField(
        junctionRecord,
        targetField,
        objectMetadataItems,
        includeRecord,
      );
      if (isDefined(result)) {
        return result;
      }
      continue;
    }

    // For regular RELATION fields, access directly by field name
    const targetObject = junctionRecord[targetField.name];

    if (
      isDefined(targetObject) &&
      typeof targetObject === 'object' &&
      'id' in targetObject
    ) {
      const targetObjectMetadata = objectMetadataItems.find(
        (item) => item.id === targetField.relation?.targetObjectMetadata.id,
      );

      if (isDefined(targetObjectMetadata)) {
        return {
          recordId: (targetObject as { id: string }).id,
          objectMetadataId: targetObjectMetadata.id,
          ...(includeRecord && { record: targetObject as ObjectRecord }),
        };
      }
    }
  }

  return null;
};

// Extract target record from a MORPH_RELATION field by iterating over its morphRelations
const extractFromMorphRelationField = (
  junctionRecord: ObjectRecord,
  targetField: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
  includeRecord: boolean,
): ExtractedTargetRecord | null => {
  const morphRelations = targetField.morphRelations;

  if (!Array.isArray(morphRelations) || morphRelations.length === 0) {
    return null;
  }

  for (const morphRelation of morphRelations) {
    // Compute the actual field name used in the junction record
    // e.g., "caretaker" + "Person" -> "caretakerPerson"
    const computedFieldName = computeMorphRelationFieldName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    });

    const targetObject = junctionRecord[computedFieldName];

    if (
      isDefined(targetObject) &&
      typeof targetObject === 'object' &&
      'id' in targetObject
    ) {
      const targetObjectMetadata = objectMetadataItems.find(
        (item) => item.id === morphRelation.targetObjectMetadata.id,
      );

      if (isDefined(targetObjectMetadata)) {
        return {
          recordId: (targetObject as { id: string }).id,
          objectMetadataId: targetObjectMetadata.id,
          ...(includeRecord && { record: targetObject as ObjectRecord }),
        };
      }
    }
  }

  return null;
};
