import {
  IconBuildingSkyscraper,
  IconLink,
  IconUser,
} from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import {
  ViewFieldChipMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldRelationMetadata,
  ViewFieldURLMetadata,
} from '@/ui/table/types/ViewField';

export const companyViewFields: ViewFieldDefinition<ViewFieldMetadata>[] = [
  {
    columnLabel: 'Name',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    columnOrder: 1,
    metadata: {
      type: 'chip',
      urlFieldName: 'domainName',
      contentFieldName: 'name',
      relationType: Entity.Company,
    },
  } as ViewFieldDefinition<ViewFieldChipMetadata>,
  {
    columnLabel: 'URL',
    columnIcon: <IconLink size={16} />,
    columnSize: 150,
    columnOrder: 2,
    metadata: {
      type: 'url',
      fieldName: 'domainName',
      placeHolder: 'example.com',
    },
  } as ViewFieldDefinition<ViewFieldURLMetadata>,
  {
    columnLabel: 'Account Owner',
    columnIcon: <IconUser size={16} />,
    columnSize: 150,
    columnOrder: 3,
    metadata: {
      type: 'relation',
      fieldName: 'accountOwner',
      relationType: Entity.User,
    },
  } as ViewFieldDefinition<ViewFieldRelationMetadata>,
];
