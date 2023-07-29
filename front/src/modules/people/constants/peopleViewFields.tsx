import {
  IconBrandLinkedin,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@tabler/icons-react';

import { Entity } from '@/ui/relation-picker/types/EntityTypeForSelect';
import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldMetadata,
  ViewFieldPhoneMetadata,
  ViewFieldRelationMetadata,
  ViewFieldTextMetadata,
  ViewFieldURLMetadata,
} from '@/ui/table/types/ViewField';

export const peopleViewFields: ViewFieldDefinition<ViewFieldMetadata>[] = [
  {
    id: 'displayName',
    columnLabel: 'People',
    columnIcon: <IconUser size={16} />,
    columnSize: 150,
    columnOrder: 1,
    metadata: {
      type: 'double-text-chip',
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
    columnOrder: 2,
    metadata: {
      type: 'text',
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'company',
    columnLabel: 'Company',
    columnIcon: <IconBuildingSkyscraper size={16} />,
    columnSize: 150,
    columnOrder: 3,
    metadata: {
      type: 'relation',
      fieldName: 'company',
      relationType: Entity.Company,
    },
  } satisfies ViewFieldDefinition<ViewFieldRelationMetadata>,
  {
    id: 'phone',
    columnLabel: 'Phone',
    columnIcon: <IconPhone size={16} />,
    columnSize: 150,
    columnOrder: 4,
    metadata: {
      type: 'phone',
      fieldName: 'phone',
      placeHolder: 'Phone',
    },
  } satisfies ViewFieldDefinition<ViewFieldPhoneMetadata>,
  {
    id: 'createdAt',
    columnLabel: 'Creation',
    columnIcon: <IconCalendar size={16} />,
    columnSize: 150,
    columnOrder: 5,
    metadata: {
      type: 'date',
      fieldName: 'createdAt',
    },
  } satisfies ViewFieldDefinition<ViewFieldDateMetadata>,
  {
    id: 'city',
    columnLabel: 'City',
    columnIcon: <IconMap size={16} />,
    columnSize: 150,
    columnOrder: 6,
    metadata: {
      type: 'text',
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'jobTitle',
    columnLabel: 'Job title',
    columnIcon: <IconBriefcase size={16} />,
    columnSize: 150,
    columnOrder: 7,
    metadata: {
      type: 'text',
      fieldName: 'jobTitle',
      placeHolder: 'Job title',
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'linkedin',
    columnLabel: 'LinkedIn',
    columnIcon: <IconBrandLinkedin size={16} />,
    columnSize: 150,
    columnOrder: 8,
    metadata: {
      type: 'url',
      fieldName: 'linkedinUrl',
      placeHolder: 'LinkedIn',
    },
  } satisfies ViewFieldDefinition<ViewFieldURLMetadata>,
];
