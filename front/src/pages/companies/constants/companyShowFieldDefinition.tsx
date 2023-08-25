import { FieldDefinition } from '@/ui/editable-field/types/FieldDefinition';
import {
  FieldBooleanMetadata,
  FieldDateMetadata,
  FieldMetadata,
  FieldMoneyMetadata,
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
  IconMoneybag,
  IconTarget,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const companyShowFieldDefinition: FieldDefinition<FieldMetadata>[] = [
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
    id: 'annualRecurringRevenue',
    label: 'ARR',
    icon: <IconMoneybag />,
    type: 'moneyAmount',
    metadata: {
      fieldName: 'annualRecurringRevenue',
    },
  } satisfies FieldDefinition<FieldMoneyMetadata>,
  {
    id: 'xUrl',
    label: 'Twitter',
    icon: <IconBrandX />,
    type: 'url',
    metadata: {
      fieldName: 'xUrl',
      placeHolder: 'X',
    },
  } satisfies FieldDefinition<FieldURLMetadata>,
];
