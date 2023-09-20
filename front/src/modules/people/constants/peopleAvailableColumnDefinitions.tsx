import {
  FieldDateMetadata,
  FieldDoubleTextChipMetadata,
  FieldEmailMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/field/types/FieldMetadata';
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
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

export const peopleAvailableColumnDefinitions: ViewFieldDefinition<FieldMetadata>[] =
  [
    {
      key: 'displayName',
      name: 'People',
      Icon: IconUser,
      size: 210,
      index: 0,
      type: 'double-text-chip',
      metadata: {
        firstValueFieldName: 'firstName',
        secondValueFieldName: 'lastName',
        firstValuePlaceholder: 'F​irst n​ame', // Hack: Fake character to prevent password-manager from filling the field
        secondValuePlaceholder: 'L​ast n​ame', // Hack: Fake character to prevent password-manager from filling the field
        avatarUrlFieldName: 'avatarUrl',
        entityType: Entity.Person,
      },
    } satisfies ViewFieldDefinition<FieldDoubleTextChipMetadata>,
    {
      key: 'email',
      name: 'Email',
      Icon: IconMail,
      size: 150,
      type: 'email',
      index: 1,
      metadata: {
        fieldName: 'email',
        placeHolder: 'Ema​il', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ViewFieldDefinition<FieldEmailMetadata>,
    {
      key: 'company',
      name: 'Company',
      Icon: IconBuildingSkyscraper,
      size: 150,
      index: 2,
      type: 'relation',
      metadata: {
        fieldName: 'company',
        relationType: Entity.Company,
      },
    } satisfies ViewFieldDefinition<FieldRelationMetadata>,
    {
      key: 'phone',
      name: 'Phone',
      Icon: IconPhone,
      size: 150,
      index: 3,
      type: 'phone',
      metadata: {
        fieldName: 'phone',
        placeHolder: 'Phon​e', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ViewFieldDefinition<FieldPhoneMetadata>,
    {
      key: 'createdAt',
      name: 'Creation',
      Icon: IconCalendarEvent,
      size: 150,
      index: 4,
      type: 'date',
      metadata: {
        fieldName: 'createdAt',
      },
    } satisfies ViewFieldDefinition<FieldDateMetadata>,
    {
      key: 'city',
      name: 'City',
      Icon: IconMap,
      size: 150,
      index: 5,
      type: 'text',
      metadata: {
        fieldName: 'city',
        placeHolder: 'Cit​y', // Hack: Fake character to prevent password-manager from filling the field
      },
    } satisfies ViewFieldDefinition<FieldTextMetadata>,
    {
      key: 'jobTitle',
      name: 'Job title',
      Icon: IconBriefcase,
      size: 150,
      index: 6,
      type: 'text',
      metadata: {
        fieldName: 'jobTitle',
        placeHolder: 'Job title',
      },
    } satisfies ViewFieldDefinition<FieldTextMetadata>,
    {
      key: 'linkedin',
      name: 'LinkedIn',
      Icon: IconBrandLinkedin,
      size: 150,
      index: 7,
      type: 'url',
      metadata: {
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn',
      },
    } satisfies ViewFieldDefinition<FieldURLMetadata>,
    {
      key: 'x',
      name: 'Twitter',
      Icon: IconBrandX,
      size: 150,
      index: 8,
      type: 'url',
      metadata: {
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
    } satisfies ViewFieldDefinition<FieldURLMetadata>,
  ];
