import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type FieldOutputSchemaV2,
  type RecordFieldLeaf,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { generateFakeValue } from '@/workflow/workflow-variables/utils/generate/generateFakeValue';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

const camelToTitleCase = (camelCaseText: string): string =>
  capitalize(
    camelCaseText
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase()),
  );

const EXCLUDED_SYSTEM_FIELDS = ['searchVector', 'position'];

const shouldGenerateFieldOutput = (
  fieldMetadataItem: FieldMetadataItem,
): boolean => {
  if (!fieldMetadataItem.isActive) {
    return false;
  }

  const isExcludedSystemField =
    (fieldMetadataItem.isSystem &&
      EXCLUDED_SYSTEM_FIELDS.includes(fieldMetadataItem.name)) ??
    false;

  if (isExcludedSystemField) {
    return false;
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    fieldMetadataItem.relation?.type !== RelationType.MANY_TO_ONE
  ) {
    return false;
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
    fieldMetadataItem.settings?.relationType !== RelationType.MANY_TO_ONE
  ) {
    return false;
  }

  return true;
};

const generateRecordField = (
  fieldMetadataItem: FieldMetadataItem,
): FieldOutputSchemaV2 => {
  const compositeType = compositeTypeDefinitions.get(fieldMetadataItem.type);
  const icon = fieldMetadataItem.icon ?? undefined;

  if (isDefined(compositeType)) {
    return {
      isLeaf: false,
      icon,
      type: fieldMetadataItem.type,
      label: fieldMetadataItem.label,
      fieldMetadataId: fieldMetadataItem.id,
      value: compositeType.properties.reduce(
        (acc, property) => {
          acc[property.name] = {
            isLeaf: true,
            type: property.type,
            label: camelToTitleCase(property.name),
            value: generateFakeValue(property.type, 'FieldMetadataType'),
            fieldMetadataId: fieldMetadataItem.id,
            isCompositeSubField: true,
          };

          return acc;
        },
        {} as Record<string, RecordFieldLeaf>,
      ),
    };
  }

  return {
    isLeaf: true,
    icon,
    type: fieldMetadataItem.type,
    label: fieldMetadataItem.label,
    value: generateFakeValue(fieldMetadataItem.type, 'FieldMetadataType'),
    fieldMetadataId: fieldMetadataItem.id,
    isCompositeSubField: false,
  };
};

const generateRecordFields = (
  objectMetadataItem: ObjectMetadataItem,
): Record<string, FieldOutputSchemaV2> => {
  const result: Record<string, FieldOutputSchemaV2> = {};

  for (const fieldMetadataItem of objectMetadataItem.fields) {
    if (!shouldGenerateFieldOutput(fieldMetadataItem)) {
      continue;
    }

    const isRelationField =
      fieldMetadataItem.type === FieldMetadataType.RELATION ||
      fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION;

    if (isRelationField) {
      const relationIdFieldName = `${fieldMetadataItem.name}Id`;
      const relationIdFieldLabel = camelToTitleCase(relationIdFieldName);

      result[relationIdFieldName] = {
        isLeaf: true,
        icon: fieldMetadataItem.icon ?? undefined,
        type: FieldMetadataType.UUID,
        label: relationIdFieldLabel,
        value: generateFakeValue(FieldMetadataType.UUID, 'FieldMetadataType'),
        fieldMetadataId: fieldMetadataItem.id,
        isCompositeSubField: false,
      };
    } else {
      result[fieldMetadataItem.name] = generateRecordField(fieldMetadataItem);
    }
  }

  return result;
};

export const generateRecordOutputSchema = (
  objectMetadataItem: ObjectMetadataItem,
): RecordOutputSchemaV2 => {
  return {
    object: {
      icon: objectMetadataItem.icon ?? undefined,
      label: objectMetadataItem.labelSingular,
      objectMetadataId: objectMetadataItem.id,
      fieldIdName: 'id',
    },
    fields: generateRecordFields(objectMetadataItem),
    _outputSchemaType: 'RECORD',
  };
};
