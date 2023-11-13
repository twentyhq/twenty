import { SortDefinition } from '@/ui/object/object-sort-dropdown/types/SortDefinition';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '../types/ObjectMetadataItem';

export const formatFieldMetadataItemsAsSortDefinitions = ({
  fields,
  icons,
}: {
  fields: Array<ObjectMetadataItem['fields'][0]>;
  icons: Record<string, any>;
}): SortDefinition[] =>
  fields.reduce((acc, field) => {
    if (
      ![
        FieldMetadataType.Date,
        FieldMetadataType.Number,
        FieldMetadataType.Text,
        FieldMetadataType.Boolean,
      ].includes(field.type)
    ) {
      return acc;
    }

    return [
      ...acc,
      {
        fieldMetadataId: field.id,
        label: field.label,
        Icon: icons[field.icon ?? 'Icon123'],
      },
    ];
  }, [] as SortDefinition[]);
