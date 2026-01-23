import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectWithId } from '@/object-record/record-field/ui/utils/junction/isObjectWithId';
import { type ExtractedTargetRecord } from '@/object-record/record-field/ui/utils/junction/types/ExtractedTargetRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

type ExtractTargetRecordsFromJunctionArgs = {
  junctionRecords: ObjectRecord[] | undefined | null;
  targetFields: FieldMetadataItem[];
  objectMetadataItems: ObjectMetadataItem[];
  includeRecord?: boolean;
};

const tryExtractFromField = (
  junctionRecord: ObjectRecord,
  fieldName: string,
  objectMetadataId: string,
  includeRecord: boolean,
): ExtractedTargetRecord | null => {
  const targetObject = junctionRecord[fieldName];

  if (!isObjectWithId(targetObject)) {
    return null;
  }

  return {
    recordId: targetObject.id,
    objectMetadataId,
    ...(includeRecord && { record: targetObject }),
  };
};

const extractFromTargetFields = (
  junctionRecord: ObjectRecord,
  targetFields: FieldMetadataItem[],
  objectMetadataItems: ObjectMetadataItem[],
  includeRecord: boolean,
): ExtractedTargetRecord | null => {
  for (const targetField of targetFields) {
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

    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === targetField.relation?.targetObjectMetadata.id,
    );

    if (isDefined(targetObjectMetadata)) {
      const result = tryExtractFromField(
        junctionRecord,
        targetField.name,
        targetObjectMetadata.id,
        includeRecord,
      );
      if (isDefined(result)) {
        return result;
      }
    }
  }

  return null;
};

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
    const computedFieldName = computeMorphRelationFieldName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular:
        morphRelation.targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural:
        morphRelation.targetObjectMetadata.namePlural,
    });

    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === morphRelation.targetObjectMetadata.id,
    );

    if (isDefined(targetObjectMetadata)) {
      const result = tryExtractFromField(
        junctionRecord,
        computedFieldName,
        targetObjectMetadata.id,
        includeRecord,
      );
      if (isDefined(result)) {
        return result;
      }
    }
  }

  return null;
};

export const extractTargetRecordsFromJunction = ({
  junctionRecords,
  targetFields,
  objectMetadataItems,
  includeRecord = false,
}: ExtractTargetRecordsFromJunctionArgs): ExtractedTargetRecord[] => {
  if (!Array.isArray(junctionRecords) || targetFields.length === 0) {
    return [];
  }

  return junctionRecords
    .filter(isDefined)
    .map((junctionRecord) =>
      extractFromTargetFields(
        junctionRecord,
        targetFields,
        objectMetadataItems,
        includeRecord,
      ),
    )
    .filter(isDefined);
};
