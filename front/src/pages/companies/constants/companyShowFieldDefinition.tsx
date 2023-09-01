import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/editable-field/types/FieldMetadata';
import {
  IconBrandX,
  IconCalendar,
  IconLink,
  IconMap,
  IconTarget,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const companyShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    key: 'domainName',
    name: 'Domain name',
    icon: <IconLink />,
    type: 'url',
    metadata: {
      fieldName: 'domainName',
      placeHolder: 'URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    key: 'accountOwner',
    name: 'Account owner',
    icon: <IconUserCircle />,
    type: 'relation',
    metadata: {
      fieldName: 'accountOwner',
      relationType: Entity.User,
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    key: 'employees',
    name: 'Employees',
    icon: <IconUsers />,
    type: 'number',
    metadata: {
      fieldName: 'employees',
      placeHolder: 'Employees',
    },
  } satisfies FieldDefinition<FieldNumberMetadata>,
  {
    key: 'address',
    name: 'Address',
    icon: <IconMap />,
    type: 'text',
    metadata: {
      fieldName: 'address',
      placeHolder: 'Address',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    id: 'idealCustomerProfile',
    label: 'ICP',
    icon: <IconTarget />,
    type: 'boolean',
    metadata: {
      fieldName: 'idealCustomerProfile',
    },
  } satisfies FieldDefinition<FieldBooleanMetadata>,
  {
    key: 'xUrl',
    name: 'Twitter',
    icon: <IconBrandX />,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
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
