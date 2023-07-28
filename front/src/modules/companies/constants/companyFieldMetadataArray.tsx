import { IconBuildingSkyscraper } from '@tabler/icons-react';

import { EntityFieldDefinition } from '@/ui/table/types/EntityFieldMetadata';

export const companyFieldMetadataArray: EntityFieldDefinition[] = [
  {
    valueFieldName: 'name',
    chipUrlFieldName: 'domainName',
    columnLabel: 'Name',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    type: 'chip',
  },
];
