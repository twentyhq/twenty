import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemsAsFilterDefinitions = ({
  fields,
}: {
  fields: Array<ObjectMetadataItem['fields'][0]>;
}): FilterDefinition[] =>
  fields.reduce((acc, field) => {
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
      ].includes(field.type)
    ) {
      return acc;
    }

    // Todo: remove once Rating fieldtype is implemented
    if (field.name === 'probability') {
      return acc;
    }

    if (field.type === FieldMetadataType.Relation) {
      if (isDefined(field.fromRelationMetadata)) {
        return acc;
      }
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
    field.toRelationMetadata?.fromObjectMetadata.namePlural,
  relationObjectMetadataNameSingular:
    field.toRelationMetadata?.fromObjectMetadata.nameSingular,
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
    default:
      return 'TEXT';
  }
};
