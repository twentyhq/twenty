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
    icon: <IconMail />,
    type: 'text',
    metadata: {
      fieldName: 'email',
      placeHolder: 'Email',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'company',
    label: 'Company',
    icon: <IconBuildingSkyscraper />,
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
    icon: <IconPhone />,
    type: 'phone',
    metadata: {
      fieldName: 'phone',
      placeHolder: 'Phone',
    },
  } satisfies FieldDefinition<FieldPhoneMetadata>,
  {
    id: 'createdAt',
    label: 'Created at',
    icon: <IconCalendar />,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
  {
    id: 'city',
    label: 'City',
    icon: <IconMap />,
    type: 'text',
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'jobTitle',
    label: 'Job Title',
    icon: <IconBriefcase />,
    type: 'text',
    metadata: {
      fieldName: 'jobTitle',
      placeHolder: 'Job Title',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'linkedinUrl',
    label: 'Linkedin URL',
    icon: <IconBrandLinkedin />,
    type: 'url',
    metadata: {
      fieldName: 'linkedinUrl',
      placeHolder: 'Linkedin URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    id: 'xUrl',
    label: 'X URL',
    icon: <IconBrandX />,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
];
