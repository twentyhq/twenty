import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMap,
} from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
  ViewFieldTextMetadata,
} from '@/ui/table/types/ViewField';

export const peopleViewFields: ViewFieldDefinition<unknown>[] = [
  {
    id: 'city',
    columnLabel: 'City',
    columnIcon: <IconMap size={16} />,
    columnSize: 150,
    type: 'text',
    columnOrder: 1,
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } as ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'jobTitle',
    columnLabel: 'Job title',
    columnIcon: <IconBriefcase size={16} />,
    columnSize: 150,
    type: 'text',
    columnOrder: 2,
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job title',
    },
  } as ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'company',
    columnLabel: 'Company',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    type: 'relation',
    relationType: Entity.Company,
    columnOrder: 3,
    metadata: {
      fieldName: 'company',
      relationType: Entity.Company,
    },
  } as ViewFieldDefinition<ViewFieldRelationMetadata>,
];
