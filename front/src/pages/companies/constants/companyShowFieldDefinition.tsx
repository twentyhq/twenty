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
    id: 'domainName',
    label: 'Domain name',
    Icon: IconLink,
    type: 'url',
    metadata: {
      fieldName: 'domainName',
      placeHolder: 'URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    id: 'accountOwner',
    label: 'Account owner',
    Icon: IconUserCircle,
    type: 'relation',
    metadata: {
      fieldName: 'accountOwner',
      relationType: Entity.User,
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    id: 'employees',
    label: 'Employees',
    Icon: IconUsers,
    type: 'number',
    metadata: {
      fieldName: 'employees',
      placeHolder: 'Employees',
    },
  } satisfies FieldDefinition<FieldNumberMetadata>,
  {
    id: 'address',
    label: 'Address',
    Icon: IconMap,
    type: 'text',
    metadata: {
      fieldName: 'address',
      placeHolder: 'Address',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
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
    id: 'idealCustomerProfile',
    label: 'ICP',
    Icon: IconTarget,
    type: 'boolean',
    metadata: {
      fieldName: 'idealCustomerProfile',
    },
  } satisfies FieldDefinition<FieldBooleanMetadata>,
  {
    id: 'xUrl',
    label: 'Twitter',
    Icon: IconBrandX,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
];
