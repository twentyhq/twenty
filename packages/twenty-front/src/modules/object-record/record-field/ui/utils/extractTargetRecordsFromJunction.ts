import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

type ExtractedTargetRecord = {
  recordId: string;
  objectMetadataId: string;
  record?: ObjectRecord;
};

type ExtractTargetRecordsFromJunctionArgs = {
  junctionRecords: ObjectRecord[] | undefined | null;
  // For morph relations - array of all fields in the morph group
  morphFields?: FieldMetadataItem[];
  // For regular relations - single target field
  targetField?: FieldMetadataItem;
  targetObjectMetadataId?: string;
  objectMetadataItems: ObjectMetadataItem[];
  isMorphRelation: boolean;
  includeRecord?: boolean;
};

export const extractTargetRecordsFromJunction = ({
  junctionRecords,
  morphFields,
  targetField,
  targetObjectMetadataId,
  objectMetadataItems,
  isMorphRelation,
  includeRecord = false,
}: ExtractTargetRecordsFromJunctionArgs): ExtractedTargetRecord[] => {
  if (!isDefined(junctionRecords) || !Array.isArray(junctionRecords)) {
    return [];
  }

  const extractedRecords: ExtractedTargetRecord[] = [];

  for (const junctionRecord of junctionRecords) {
    if (!isDefined(junctionRecord)) {
      continue;
    }

    let extracted: ExtractedTargetRecord | null = null;

    if (isMorphRelation && isDefined(morphFields) && morphFields.length > 0) {
      // Use morphFields to extract - check each morph field's name
      extracted = extractFromMorphFields(
        junctionRecord,
        morphFields,
        objectMetadataItems,
        includeRecord,
      );
    } else if (isDefined(targetField)) {
      // Use single target field for regular relations
      extracted = extractFromRegularRelation(
        junctionRecord,
        targetField,
        targetObjectMetadataId,
        includeRecord,
      );
    }

    if (isDefined(extracted)) {
      extractedRecords.push(extracted);
    }
  }

  return extractedRecords;
};

// Extract target record from junction using morph fields (checks each field's name)
const extractFromMorphFields = (
  junctionRecord: ObjectRecord,
  morphFields: FieldMetadataItem[],
  objectMetadataItems: ObjectMetadataItem[],
  includeRecord: boolean,
): ExtractedTargetRecord | null => {
  for (const morphField of morphFields) {
    const targetObject = junctionRecord[morphField.name];

    if (
      isDefined(targetObject) &&
      typeof targetObject === 'object' &&
      'id' in targetObject
    ) {
      const targetObjectMetadata = objectMetadataItems.find(
        (item) => item.id === morphField.relation?.targetObjectMetadata.id,
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

const extractFromRegularRelation = (
  junctionRecord: ObjectRecord,
  targetField: FieldMetadataItem,
  targetObjectMetadataId: string | undefined,
  includeRecord: boolean,
): ExtractedTargetRecord | null => {
  const targetObject = junctionRecord[targetField.name];

  if (
    isDefined(targetObject) &&
    typeof targetObject === 'object' &&
    'id' in targetObject &&
    isDefined(targetObjectMetadataId)
  ) {
    return {
      recordId: (targetObject as { id: string }).id,
      objectMetadataId: targetObjectMetadataId,
      ...(includeRecord && { record: targetObject as ObjectRecord }),
    };
  }

  return null;
};
