import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/editable-field/types/FieldMetadata';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconMail,
  IconMap,
  IconPhone,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const personShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    id: 'email',
    label: 'Email',
    Icon: IconMail,
    type: 'text',
    metadata: {
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'company',
    label: 'Company',
    Icon: IconBuildingSkyscraper,
    type: 'relation',
    metadata: {
      fieldName: 'company',
      relationType: Entity.Company,
      useEditButton: true,
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    id: 'phone',
    label: 'Phone',
    Icon: IconPhone,
    type: 'phone',
    metadata: {
      fieldName: 'phone',
      placeHolder: 'Phone',
    },
  } satisfies FieldDefinition<FieldPhoneMetadata>,
  {
    id: 'createdAt',
    label: 'Created at',
    Icon: IconCalendar,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
  {
    id: 'city',
    label: 'City',
    Icon: IconMap,
    type: 'text',
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'jobTitle',
    label: 'Job Title',
    Icon: IconBriefcase,
    type: 'text',
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job Title',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'linkedinUrl',
    label: 'Linkedin URL',
    Icon: IconBrandLinkedin,
    type: 'url',
    metadata: {
      fieldName: 'linkedinUrl',
      placeHolder: 'Linkedin URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    id: 'xUrl',
    label: 'X URL',
    Icon: IconBrandX,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
];
