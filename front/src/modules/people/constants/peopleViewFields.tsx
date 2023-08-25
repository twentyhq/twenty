import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
  ViewFieldDoubleTextChipMetadata,
  ViewFieldEmailMetadata,
  ViewFieldMetadata,
  ViewFieldPhoneMetadata,
  ViewFieldRelationMetadata,
  ViewFieldTextMetadata,
  ViewFieldURLMetadata,
} from '@/ui/editable-field/types/ViewField';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconMail,
  IconMap,
  IconPhone,
  IconUser,
} from '@/ui/icon/index';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const peopleViewFields: ViewFieldDefinition<ViewFieldMetadata>[] = [
  {
    id: 'displayName',
    columnLabel: 'People',
    columnIcon: <IconUser />,
    columnSize: 210,
    columnOrder: 1,
    metadata: {
      type: 'double-text-chip',
      firstValueFieldName: 'firstName',
      secondValueFieldName: 'lastName',
      firstValuePlaceholder: 'F​irst n​ame', // Hack: Fake character to prevent password-manager from filling the field
      secondValuePlaceholder: 'L​ast n​ame', // Hack: Fake character to prevent password-manager from filling the field
      avatarUrlFieldName: 'avatarUrl',
      entityType: Entity.Person,
    },
  } satisfies ViewFieldDefinition<ViewFieldDoubleTextChipMetadata>,
  {
    id: 'email',
    columnLabel: 'Email',
    columnIcon: <IconMail />,
    columnSize: 150,
    columnOrder: 2,
    metadata: {
      type: 'email',
      fieldName: 'email',
      placeHolder: 'Ema​il', // Hack: Fake character to prevent password-manager from filling the field
    },
  } satisfies ViewFieldDefinition<ViewFieldEmailMetadata>,
  {
    id: 'company',
    columnLabel: 'Company',
    columnIcon: <IconBuildingSkyscraper />,
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
    columnIcon: <IconPhone />,
    columnSize: 150,
    columnOrder: 4,
    metadata: {
      type: 'phone',
      fieldName: 'phone',
      placeHolder: 'Phon​e', // Hack: Fake character to prevent password-manager from filling the field
    },
  } satisfies ViewFieldDefinition<ViewFieldPhoneMetadata>,
  {
    id: 'createdAt',
    columnLabel: 'Creation',
    columnIcon: <IconCalendarEvent />,
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
    columnIcon: <IconMap />,
    columnSize: 150,
    columnOrder: 6,
    metadata: {
      type: 'text',
      fieldName: 'city',
      placeHolder: 'Cit​y', // Hack: Fake character to prevent password-manager from filling the field
    },
  } satisfies ViewFieldDefinition<ViewFieldTextMetadata>,
  {
    id: 'jobTitle',
    columnLabel: 'Job title',
    columnIcon: <IconBriefcase />,
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
    columnIcon: <IconBrandLinkedin />,
    columnSize: 150,
    columnOrder: 8,
    metadata: {
      type: 'url',
      fieldName: 'linkedinUrl',
      placeHolder: 'LinkedIn',
    },
  } satisfies ViewFieldDefinition<ViewFieldURLMetadata>,
  {
    id: 'x',
    columnLabel: 'Twitter',
    columnIcon: <IconBrandX />,
    columnSize: 150,
    columnOrder: 9,
    metadata: {
      type: 'url',
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
  } satisfies ViewFieldDefinition<ViewFieldURLMetadata>,
];
