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
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/object/field/types/FieldMetadata';
import { User } from '~/generated/graphql';

export const companyShowFieldDefinitions: FieldDefinition<FieldMetadata>[] = [
  {
    fieldId: 'domainName',
    label: 'Domain name',
    Icon: IconLink,
    type: 'URL',
    metadata: {
      fieldName: 'domainName',
      placeHolder: 'URL',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldId: 'accountOwner',
    label: 'Account owner',
    Icon: IconUserCircle,
    type: 'RELATION',
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
    type: 'NUMBER',
    metadata: {
      fieldName: 'employees',
      placeHolder: 'Employees',
    },
  } satisfies FieldDefinition<FieldNumberMetadata>,
  {
    fieldId: 'address',
    label: 'Address',
    Icon: IconMap,
    type: 'TEXT',
    metadata: {
      fieldName: 'address',
      placeHolder: 'Address',
    },
  } satisfies FieldDefinition<FieldTextMetadata>,
  {
    fieldId: 'idealCustomerProfile',
    label: 'ICP',
    Icon: IconTarget,
    type: 'BOOLEAN',
    metadata: {
      fieldName: 'idealCustomerProfile',
    },
  } satisfies FieldDefinition<FieldBooleanMetadata>,
  {
    fieldId: 'xUrl',
    label: 'Twitter',
    Icon: IconBrandX,
    type: 'URL',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
  {
    fieldId: 'createdAt',
    label: 'Created at',
    Icon: IconCalendar,
    type: 'DATE',
    metadata: {
      fieldName: 'createdAt',
    },
  } satisfies FieldDefinition<FieldDateMetadata>,
];
