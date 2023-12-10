import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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
        FieldMetadataType.FullName,
        FieldMetadataType.Relation,
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
      if (field.fromRelationMetadata) {
        return acc;
      }
    }

    return [...acc, formatFieldMetadataItemAsFilterDefinition({ field })];
  }, [] as FilterDefinition[]);

const formatFieldMetadataItemAsFilterDefinition = ({
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
  type:
    field.type === FieldMetadataType.DateTime
      ? 'DATE_TIME'
      : field.type === FieldMetadataType.Link
        ? 'LINK'
        : field.type === FieldMetadataType.FullName
          ? 'FULL_NAME'
          : field.type === FieldMetadataType.Number
            ? 'NUMBER'
            : field.type === FieldMetadataType.Currency
              ? 'CURRENCY'
              : field.type === FieldMetadataType.Email
                ? 'TEXT'
                : field.type === FieldMetadataType.Phone
                  ? 'TEXT'
                  : field.type === FieldMetadataType.Relation
                    ? 'RELATION'
                    : 'TEXT',
});
