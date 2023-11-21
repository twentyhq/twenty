import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
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
        FieldMetadataType.Number,
        FieldMetadataType.Currency,
        FieldMetadataType.Text,
      ].includes(field.type) ||
      field.name === 'probability'
    ) {
      return acc;
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
  type:
    field.type === FieldMetadataType.DateTime
      ? 'DATE_TIME'
      : field.type === FieldMetadataType.Number
      ? 'NUMBER'
      : field.type === FieldMetadataType.Currency
      ? 'CURRENCY'
      : 'TEXT',
});
