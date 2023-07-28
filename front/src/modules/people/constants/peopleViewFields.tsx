import {
  IconBriefcase,
  IconBuildingSkyscraper,
  IconMail,
  IconMap,
  IconUser,
} from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import {
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldRelationMetadata,
  ViewFieldTextMetadata,
} from '@/ui/table/types/ViewField';

export const peopleViewFields: ViewFieldDefinition<unknown>[] = [
  {
    id: 'displayName',
    columnLabel: 'People',
    columnIcon: <IconUser size={16} />,
    columnSize: 150,
    type: 'double-text-chip',
    columnOrder: 1,
    metadata: {
      firstValueFieldName: 'firstName',
      secondValueFieldName: 'lastName',
      firstValuePlaceholder: 'First name',
      secondValuePlaceholder: 'Last name',
      entityType: Entity.Person,
    },
  } satisfies ViewFieldDefinition<ViewFieldDoubleTextChipMetadata>,
  {
    id: 'email',
    columnLabel: 'Email',
    columnIcon: <IconMail size={16} />,
    columnSize: 150,
    type: 'text',
    columnOrder: 2,
    metadata: {
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'company',
    columnLabel: 'Company',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    type: 'relation',
    columnOrder: 3,
    metadata: {
      fieldName: 'company',
      relationType: Entity.Company,
    },
  } satisfies ViewFieldDefinition<ViewFieldRelationMetadata>,
  {
    id: 'city',
    columnLabel: 'City',
    columnIcon: <IconMap size={16} />,
    columnSize: 150,
    type: 'text',
    columnOrder: 4,
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'jobTitle',
    columnLabel: 'Job title',
    columnIcon: <IconBriefcase size={16} />,
    columnSize: 150,
    type: 'text',
    columnOrder: 5,
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job title',
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
];
