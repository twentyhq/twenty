import { FilterDefinition } from '@/ui/object/object-filter-dropdown/types/FilterDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemsAsFilterDefinitions = ({
  fields,
  icons,
}: {
  fields: Array<ObjectMetadataItem['fields'][0]>;
  icons: Record<string, any>;
}): FilterDefinition[] =>
  fields.reduce(
    (acc, field) =>
      [
        FieldMetadataType.Date,
        FieldMetadataType.Number,
        FieldMetadataType.Text,
      ].includes(field.type)
        ? [
            ...acc,
            {
              fieldMetadataId: field.id,
              label: field.label,
              Icon: icons[field.icon ?? 'Icon123'],
              type:
                field.type === FieldMetadataType.Date
                  ? 'DATE'
                  : field.type === FieldMetadataType.Number
                  ? 'NUMBER'
                  : 'TEXT',
            },
          ]
        : acc,
    [] as FilterDefinition[],
  );
