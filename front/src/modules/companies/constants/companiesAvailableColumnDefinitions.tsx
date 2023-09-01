import type {
  ViewFieldBooleanMetadata,
  ViewFieldChipMetadata,
  ViewFieldDateMetadata,
  ViewFieldMetadata,
  ViewFieldMoneyMetadata,
  ViewFieldNumberMetadata,
  ViewFieldRelationMetadata,
  ViewFieldTextMetadata,
  ViewFieldURLMetadata,
} from '@/ui/editable-field/types/ViewField';
import {
  IconBrandLinkedin,
  IconBrandX,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconLink,
  IconMap,
  IconMoneybag,
  IconTarget,
  IconUserCircle,
  IconUsers,
} from '@/ui/icon/index';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import type { ColumnDefinition } from '@/ui/table/types/ColumnDefinition';

export const companiesAvailableColumnDefinitions: ColumnDefinition<ViewFieldMetadata>[] =
  [
    {
      key: 'name',
      label: 'Name',
      icon: <IconBuildingSkyscraper />,
      size: 180,
      order: 1,
      metadata: {
        type: 'chip',
        urlFieldName: 'domainName',
        contentFieldName: 'name',
        relationType: Entity.Company,
      },
      isVisible: true,
    } as ColumnDefinition<ViewFieldChipMetadata>,
    {
      key: 'domainName',
      label: 'URL',
      icon: <IconLink />,
      size: 100,
      order: 2,
      metadata: {
        type: 'url',
        fieldName: 'domainName',
        placeHolder: 'example.com',
      },
      isVisible: true,
    } as ColumnDefinition<ViewFieldURLMetadata>,
    {
      key: 'accountOwner',
      label: 'Account Owner',
      icon: <IconUserCircle />,
      size: 150,
      order: 3,
      metadata: {
        type: 'relation',
        fieldName: 'accountOwner',
        relationType: Entity.User,
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldRelationMetadata>,
    {
      key: 'createdAt',
      label: 'Creation',
      icon: <IconCalendarEvent />,
      size: 150,
      order: 4,
      metadata: {
        type: 'date',
        fieldName: 'createdAt',
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldDateMetadata>,
    {
      key: 'employees',
      label: 'Employees',
      icon: <IconUsers />,
      size: 150,
      order: 5,
      metadata: {
        type: 'number',
        fieldName: 'employees',
        isPositive: true,
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldNumberMetadata>,
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: <IconBrandLinkedin />,
      size: 170,
      order: 6,
      metadata: {
        type: 'url',
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn URL',
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
    {
      key: 'address',
      label: 'Address',
      icon: <IconMap />,
      size: 170,
      order: 7,
      metadata: {
        type: 'text',
        fieldName: 'address',
        placeHolder: 'Addre​ss', // Hack: Fake character to prevent password-manager from filling the field
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldTextMetadata>,
    {
      key: 'idealCustomerProfile',
      label: 'ICP',
      icon: <IconTarget />,
      size: 150,
      order: 8,
      metadata: {
        type: 'boolean',
        fieldName: 'idealCustomerProfile',
      },
      isVisible: false,
    } satisfies ColumnDefinition<ViewFieldBooleanMetadata>,
    {
      key: 'annualRecurringRevenue',
      label: 'ARR',
      icon: <IconMoneybag />,
      size: 150,
      order: 8,
      metadata: {
        type: 'moneyAmount',
        fieldName: 'annualRecurringRevenue',
      },
    } satisfies ColumnDefinition<ViewFieldMoneyMetadata>,
    {
      key: 'xUrl',
      label: 'Twitter',
      icon: <IconBrandX />,
      size: 150,
      order: 8,
      metadata: {
        type: 'url',
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
      isVisible: false,
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
  ];
