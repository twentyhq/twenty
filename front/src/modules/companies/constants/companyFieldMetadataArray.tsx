import { IconBuildingSkyscraper } from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import {
  ViewFieldChipMetadata,
  ViewFieldDefinition,
} from '@/ui/table/types/ViewField';

export const companyFieldMetadataArray: ViewFieldDefinition<unknown>[] = [
  {
    columnLabel: 'Name',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    type: 'chip',
    columnOrder: 1,
    metadata: {
      urlFieldName: 'url',
      contentFieldName: 'name',
      relationType: Entity.Company,
    },
  } as ViewFieldDefinition<ViewFieldChipMetadata>,
];
