import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemsAsFilterDefinitions = ({
  fields,
  isJsonFilterEnabled,
}: {
  fields: Array<ObjectMetadataItem['fields'][0]>;
  isJsonFilterEnabled: boolean;
}): RecordFilterDefinition[] => {
  return fields.reduce((acc, field) => {
    if (
      field.type === FieldMetadataType.RELATION &&
      field.relationDefinition?.direction !==
        RelationDefinitionType.MANY_TO_ONE &&
      field.relationDefinition?.direction !== RelationDefinitionType.ONE_TO_ONE
    ) {
      return acc;
    }

    if (
      ![
        FieldMetadataType.BOOLEAN,
        FieldMetadataType.DATE_TIME,
        FieldMetadataType.DATE,
        FieldMetadataType.TEXT,
        FieldMetadataType.EMAILS,
        FieldMetadataType.NUMBER,
        FieldMetadataType.LINKS,
        FieldMetadataType.FULL_NAME,
        FieldMetadataType.ADDRESS,
        FieldMetadataType.RELATION,
        FieldMetadataType.SELECT,
        FieldMetadataType.MULTI_SELECT,
        FieldMetadataType.CURRENCY,
        FieldMetadataType.RATING,
        FieldMetadataType.ACTOR,
        FieldMetadataType.PHONES,
        FieldMetadataType.ARRAY,
        ...(isJsonFilterEnabled ? [FieldMetadataType.RAW_JSON] : []),
      ].includes(field.type)
    ) {
      return acc;
    }

    return [...acc, formatFieldMetadataItemAsFilterDefinition({ field })];
  }, [] as RecordFilterDefinition[]);
};

export const formatFieldMetadataItemAsFilterDefinition = ({
  field,
}: {
  field: ObjectMetadataItem['fields'][0];
}): RecordFilterDefinition => ({
  fieldMetadataId: field.id,
  label: field.label,
  iconName: field.icon ?? 'Icon123',
  type: getFilterTypeFromFieldType(field.type),
});

export const getRelationObjectMetadataNameSingular = ({
  field,
}: {
  field: ObjectMetadataItem['fields'][0];
}): string | undefined => {
  return field.relationDefinition?.targetObjectMetadata.nameSingular;
};

export const getRelationObjectMetadataNamePlural = ({
  field,
}: {
  field: ObjectMetadataItem['fields'][0];
}): string | undefined => {
  return field.relationDefinition?.targetObjectMetadata.namePlural;
};

export const getFilterTypeFromFieldType = (
  fieldType: FieldMetadataType,
): FilterableFieldType => {
  switch (fieldType) {
    case FieldMetadataType.DATE_TIME:
      return 'DATE_TIME';
    case FieldMetadataType.DATE:
      return 'DATE';
    case FieldMetadataType.LINKS:
      return 'LINKS';
    case FieldMetadataType.FULL_NAME:
      return 'FULL_NAME';
    case FieldMetadataType.NUMBER:
      return 'NUMBER';
    case FieldMetadataType.CURRENCY:
      return 'CURRENCY';
    case FieldMetadataType.EMAILS:
      return 'EMAILS';
    case FieldMetadataType.PHONES:
      return 'PHONES';
    case FieldMetadataType.RELATION:
      return 'RELATION';
    case FieldMetadataType.SELECT:
      return 'SELECT';
    case FieldMetadataType.MULTI_SELECT:
      return 'MULTI_SELECT';
    case FieldMetadataType.ADDRESS:
      return 'ADDRESS';
    case FieldMetadataType.RATING:
      return 'RATING';
    case FieldMetadataType.ACTOR:
      return 'ACTOR';
    case FieldMetadataType.ARRAY:
      return 'ARRAY';
    case FieldMetadataType.RAW_JSON:
      return 'RAW_JSON';
    case FieldMetadataType.BOOLEAN:
      return 'BOOLEAN';
    default:
      return 'TEXT';
  }
};
