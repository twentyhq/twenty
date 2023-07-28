import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMap,
} from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import { EntityFieldDefinition } from '@/ui/table/types/EntityFieldMetadata';

export const peopleFieldMetadataArray: EntityFieldDefinition[] = [
  {
    valueFieldName: 'city',
    columnLabel: 'City',
    columnIcon: <IconMap size={16} />,
    columnSize: 150,
    type: 'text',
  },
  {
    valueFieldName: 'jobTitle',
    columnLabel: 'Job title',
    columnIcon: <IconBriefcase size={16} />,
    columnSize: 150,
    type: 'text',
  },
  {
    valueFieldName: 'company',
    columnLabel: 'Company',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    type: 'relation',
    relationType: Entity.Company,
  },
];
