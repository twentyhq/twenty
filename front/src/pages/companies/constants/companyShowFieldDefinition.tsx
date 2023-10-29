import { FieldDefinition } from '@/ui/data/field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/data/field/types/FieldMetadata';
import {
  IconBrandX,
  IconCalendar,
  IconLink,
  IconMap,
  IconTarget,
  IconUserCircle,
  IconUsers,
} from '@/ui/display/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { User } from '~/generated/graphql';

export const companyShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
  {
    fieldId: 'domainName',
    label: 'Domain name',
    Icon: IconLink,
    type: 'url',
    metadata: {
      fieldName: 'domainName',
      placeHolder: 'URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldId: 'accountOwner',
    label: 'Account owner',
    Icon: IconUserCircle,
    type: 'relation',
    metadata: {
      fieldName: 'accountOwner',
      relationType: Entity.User,
    },
    entityChipDisplayMapper: (dataObject: User) => {
      return {
        name: dataObject?.displayName,
        pictureUrl: dataObject?.avatarUrl ?? undefined,
        avatarType: 'rounded',
      };
    },
  } satisfies FieldDefinition<FieldRelationMetadata>,
  {
    fieldId: 'employees',
    label: 'Employees',
    Icon: IconUsers,
    type: 'number',
    metadata: {
      fieldName: 'employees',
      placeHolder: 'Employees',
    },
  } satisfies FieldDefinition<FieldNumberMetadata>,
  {
    fieldId: 'address',
    label: 'Address',
    Icon: IconMap,
    type: 'text',
    metadata: {
      fieldName: 'address',
      placeHolder: 'Address',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldId: 'idealCustomerProfile',
    label: 'ICP',
    Icon: IconTarget,
    type: 'boolean',
    metadata: {
      fieldName: 'idealCustomerProfile',
    },
  } satisfies FieldDefinition<FieldBooleanMetadata>,
  {
    fieldId: 'xUrl',
    label: 'Twitter',
    Icon: IconBrandX,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldId: 'createdAt',
    label: 'Created at',
    Icon: IconCalendar,
    type: 'date',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
