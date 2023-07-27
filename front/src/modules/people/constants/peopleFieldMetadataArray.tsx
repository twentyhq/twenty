import { IconBriefcase, IconMap } from '@tabler/icons-react';

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
];
