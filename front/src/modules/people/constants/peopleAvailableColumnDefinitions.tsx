import type {
  ViewFieldDateMetadata,
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
import type { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';

export const peopleAvailableColumnDefinitions: ColumnDefinition<ViewFieldMetadata>[] =
  [
    {
      key: 'displayName',
      name: 'People',
      icon: <IconUser />,
      size: 210,
      index: 0,
      metadata: {
        type: 'double-text-chip',
        firstValueFieldName: 'firstName',
        secondValueFieldName: 'lastName',
        firstValuePlaceholder: 'F​irst n​ame', // Hack: Fake character to prevent password-manager from filling the field
        secondValuePlaceholder: 'L​ast n​ame', // Hack: Fake character to prevent password-manager from filling the field
        avatarUrlFieldName: 'avatarUrl',
        entityType: Entity.Person,
      },
    } satisfies ColumnDefinition<ViewFieldDoubleTextChipMetadata>,
    {
      key: 'email',
      name: 'Email',
      icon: <IconMail />,
      size: 150,
      index: 1,
      metadata: {
        type: 'email',
        fieldName: 'email',
        placeHolder: 'Ema​il', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ColumnDefinition<ViewFieldEmailMetadata>,
    {
      key: 'company',
      name: 'Company',
      icon: <IconBuildingSkyscraper />,
      size: 150,
      index: 2,
      metadata: {
        type: 'relation',
        fieldName: 'company',
        relationType: Entity.Company,
      },
    } satisfies ColumnDefinition<ViewFieldRelationMetadata>,
    {
      key: 'phone',
      name: 'Phone',
      icon: <IconPhone />,
      size: 150,
      index: 3,
      metadata: {
        type: 'phone',
        fieldName: 'phone',
        placeHolder: 'Phon​e', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ColumnDefinition<ViewFieldPhoneMetadata>,
    {
      key: 'createdAt',
      name: 'Creation',
      icon: <IconCalendarEvent />,
      size: 150,
      index: 4,
      metadata: {
        type: 'date',
        fieldName: 'createdAt',
      },
    } satisfies ColumnDefinition<ViewFieldDateMetadata>,
    {
      key: 'city',
      name: 'City',
      icon: <IconMap />,
      size: 150,
      index: 5,
      metadata: {
        type: 'text',
        fieldName: 'city',
        placeHolder: 'Cit​y', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ColumnDefinition<ViewFieldTextMetadata>,
    {
      key: 'jobTitle',
      name: 'Job title',
      icon: <IconBriefcase />,
      size: 150,
      index: 6,
      metadata: {
        type: 'text',
        fieldName: 'jobTitle',
        placeHolder: 'Job title',
      },
    } satisfies ColumnDefinition<ViewFieldTextMetadata>,
    {
      key: 'linkedin',
      name: 'LinkedIn',
      icon: <IconBrandLinkedin />,
      size: 150,
      index: 7,
      metadata: {
        type: 'url',
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn',
      },
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
    {
      key: 'x',
      name: 'Twitter',
      icon: <IconBrandX />,
      size: 150,
      index: 8,
      metadata: {
        type: 'url',
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
  ];
