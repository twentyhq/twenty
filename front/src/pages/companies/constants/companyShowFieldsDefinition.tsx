import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/editable-field/types/FieldMetadata';
import {
  IconCalendar,
  IconLink,
  IconMap,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const companyShowFieldsDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    id: 'domainName',
    label: 'Domain name',
    icon: <IconLink />,
    type: 'url',
    metadata: {
      fieldName: 'domainName',
      placeHolder: 'URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    id: 'accountOwner',
    label: 'Account owner',
    icon: <IconUserCircle />,
    type: 'relation',
    metadata: {
      fieldName: 'accountOwner',
      relationType: Entity.User,
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    id: 'employees',
    label: 'Employees',
    icon: <IconUsers />,
    type: 'number',
    metadata: {
      fieldName: 'employees',
      placeHolder: 'Employees',
    },
  } satisfies FieldDefinition<FieldNumberMetadata>,
  {
    id: 'address',
    label: 'Address',
    icon: <IconMap />,
    type: 'text',
    metadata: {
      fieldName: 'address',
      placeHolder: 'Address',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'createdAt',
    label: 'Created at',
    icon: <IconCalendar />,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
