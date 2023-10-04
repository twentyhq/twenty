import { FieldDefinition } from '@/ui/field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/field/types/FieldMetadata';
import {
  IconBrandX,
  IconCalendar,
  IconLink,
  IconMap,
  IconPencil,
  IconTarget,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const companyShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    key: 'domainName',
    name: 'Domain name',
    Icon: IconLink,
    type: 'url',
    metadata: {
      fieldName: 'domainName',
      placeHolder: 'URL',
    },
    buttonIcon: IconPencil,
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    key: 'accountOwner',
    name: 'Account owner',
    Icon: IconUserCircle,
    type: 'relation',
    metadata: {
      fieldName: 'accountOwner',
      relationType: Entity.User,
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    key: 'employees',
    name: 'Employees',
    Icon: IconUsers,
    type: 'number',
    metadata: {
      fieldName: 'employees',
      placeHolder: 'Employees',
    },
  } satisfies FieldDefinition<FieldNumberMetadata>,
  {
    key: 'address',
    name: 'Address',
    Icon: IconMap,
    type: 'text',
    metadata: {
      fieldName: 'address',
      placeHolder: 'Address',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    key: 'idealCustomerProfile',
    name: 'ICP',
    Icon: IconTarget,
    type: 'boolean',
    metadata: {
      fieldName: 'idealCustomerProfile',
    },
  } satisfies FieldDefinition<FieldBooleanMetadata>,
  {
    key: 'xUrl',
    name: 'Twitter',
    Icon: IconBrandX,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
    buttonIcon: IconPencil,
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    key: 'createdAt',
    name: 'Created at',
    Icon: IconCalendar,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
