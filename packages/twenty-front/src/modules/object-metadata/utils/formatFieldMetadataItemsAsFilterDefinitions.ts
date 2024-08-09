import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemsAsFilterDefinitions = ({
  fields,
}: {
  fields: Array<ObjectMetadataItem['fields'][0]>;
}): FilterDefinition[] =>
  fields.reduce((acc, field) => {
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
        FieldMetadataType.DateTime,
        FieldMetadataType.Text,
        FieldMetadataType.Email,
        FieldMetadataType.Number,
        FieldMetadataType.Link,
        FieldMetadataType.Links,
        FieldMetadataType.FullName,
        FieldMetadataType.Address,
        FieldMetadataType.Relation,
        FieldMetadataType.Select,
        FieldMetadataType.Currency,
        FieldMetadataType.Rating,
        FieldMetadataType.Actor,
      ].includes(field.type)
    ) {
      return acc;
    }

    return [...acc, formatFieldMetadataItemAsFilterDefinition({ field })];
  }, [] as FilterDefinition[]);

export const formatFieldMetadataItemAsFilterDefinition = ({
  field,
}: {
  field: ObjectMetadataItem['fields'][0];
}): FilterDefinition => ({
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
    case FieldMetadataType.Link:
      return 'LINK';
    case FieldMetadataType.Links:
      return 'LINKS';
    case FieldMetadataType.FullName:
      return 'FULL_NAME';
    case FieldMetadataType.Number:
      return 'NUMBER';
    case FieldMetadataType.Currency:
      return 'CURRENCY';
    case FieldMetadataType.Email:
      return 'EMAIL';
    case FieldMetadataType.Phone:
      return 'PHONE';
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
    default:
      return 'TEXT';
  }
};
