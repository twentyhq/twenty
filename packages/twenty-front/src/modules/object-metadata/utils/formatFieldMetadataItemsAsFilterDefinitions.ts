import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

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
      field.type === FieldMetadataType.Relation &&
      field.relationDefinition?.direction !==
        RelationDefinitionType.ManyToOne &&
      field.relationDefinition?.direction !== RelationDefinitionType.OneToOne
    ) {
      return acc;
    }

    if (
      ![
        FieldMetadataType.Boolean,
        FieldMetadataType.DateTime,
        FieldMetadataType.Date,
        FieldMetadataType.Text,
        FieldMetadataType.Emails,
        FieldMetadataType.Number,
        FieldMetadataType.Links,
        FieldMetadataType.FullName,
        FieldMetadataType.Address,
        FieldMetadataType.Relation,
        FieldMetadataType.Select,
        FieldMetadataType.MultiSelect,
        FieldMetadataType.Currency,
        FieldMetadataType.Rating,
        FieldMetadataType.Actor,
        FieldMetadataType.Phones,
        FieldMetadataType.Array,
        ...(isJsonFilterEnabled ? [FieldMetadataType.RawJson] : []),
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
  relationObjectMetadataNamePlural:
    field.relationDefinition?.targetObjectMetadata.namePlural,
  relationObjectMetadataNameSingular:
    field.relationDefinition?.targetObjectMetadata.nameSingular,
  type: getFilterTypeFromFieldType(field.type),
});

export const getFilterTypeFromFieldType = (fieldType: FieldMetadataType) => {
  switch (fieldType) {
    case FieldMetadataType.DateTime:
      return 'DATE_TIME';
    case FieldMetadataType.Date:
      return 'DATE';
    case FieldMetadataType.Links:
      return 'LINKS';
    case FieldMetadataType.FullName:
      return 'FULL_NAME';
    case FieldMetadataType.Number:
      return 'NUMBER';
    case FieldMetadataType.Currency:
      return 'CURRENCY';
    case FieldMetadataType.Emails:
      return 'EMAILS';
    case FieldMetadataType.Phones:
      return 'PHONES';
    case FieldMetadataType.Relation:
      return 'RELATION';
    case FieldMetadataType.Select:
      return 'SELECT';
    case FieldMetadataType.MultiSelect:
      return 'MULTI_SELECT';
    case FieldMetadataType.Address:
      return 'ADDRESS';
    case FieldMetadataType.Rating:
      return 'RATING';
    case FieldMetadataType.Actor:
      return 'ACTOR';
    case FieldMetadataType.Array:
      return 'ARRAY';
    case FieldMetadataType.RawJson:
      return 'RAW_JSON';
    case FieldMetadataType.Boolean:
      return 'BOOLEAN';
    default:
      return 'TEXT';
  }
};
