import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldPhoneMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
} from '@/ui/editable-field/types/FieldMetadata';
import {
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
    id: 'city',
    label: 'City',
    icon: <IconMap />,
    type: 'text',
    metadata: {
      fieldName: 'city',
      placeHolder: 'City',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
];
