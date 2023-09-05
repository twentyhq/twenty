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
      id: 'displayName',
      label: 'People',
      icon: IconUser,
      size: 210,
      order: 1,
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
      id: 'email',
      label: 'Email',
      icon: IconMail,
      size: 150,
      order: 2,
      metadata: {
        type: 'email',
        fieldName: 'email',
        placeHolder: 'Ema​il', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ColumnDefinition<ViewFieldEmailMetadata>,
    {
      id: 'company',
      label: 'Company',
      icon: IconBuildingSkyscraper,
      size: 150,
      order: 3,
      metadata: {
        type: 'relation',
        fieldName: 'company',
        relationType: Entity.Company,
      },
    } satisfies ColumnDefinition<ViewFieldRelationMetadata>,
    {
      id: 'phone',
      label: 'Phone',
      icon: IconPhone,
      size: 150,
      order: 4,
      metadata: {
        type: 'phone',
        fieldName: 'phone',
        placeHolder: 'Phon​e', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ColumnDefinition<ViewFieldPhoneMetadata>,
    {
      id: 'createdAt',
      label: 'Creation',
      icon: IconCalendarEvent,
      size: 150,
      order: 5,
      metadata: {
        type: 'date',
        fieldName: 'createdAt',
      },
    } satisfies ColumnDefinition<ViewFieldDateMetadata>,
    {
      id: 'city',
      label: 'City',
      icon: IconMap,
      size: 150,
      order: 6,
      metadata: {
        type: 'text',
        fieldName: 'city',
        placeHolder: 'Cit​y', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ColumnDefinition<ViewFieldTextMetadata>,
    {
      id: 'jobTitle',
      label: 'Job title',
      icon: IconBriefcase,
      size: 150,
      order: 7,
      metadata: {
        type: 'text',
        fieldName: 'jobTitle',
        placeHolder: 'Job title',
      },
    } satisfies ColumnDefinition<ViewFieldTextMetadata>,
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: IconBrandLinkedin,
      size: 150,
      order: 8,
      metadata: {
        type: 'url',
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn',
      },
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
    {
      id: 'x',
      label: 'Twitter',
      icon: IconBrandX,
      size: 150,
      order: 9,
      metadata: {
        type: 'url',
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
  ];
