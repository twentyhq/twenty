import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMap,
} from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';

export const peopleFieldMetadataArray: EntityFieldMetadata[] = [
  {
    fieldName: 'city',
    label: 'City',
    icon: <IconMap size={16} />,
    columnSize: 150,
    type: 'text',
  },
  {
    fieldName: 'jobTitle',
    label: 'Job title',
    icon: <IconBriefcase size={16} />,
    columnSize: 150,
    type: 'text',
  },
  {
    fieldName: 'company',
    label: 'Company',
    icon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    type: 'relation',
    relationType: Entity.Company,
  },
];
