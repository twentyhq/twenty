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
      name: 'Name',
      Icon: IconBuildingSkyscraper,
      size: 180,
      index: 0,
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
      name: 'URL',
      Icon: IconLink,
      size: 100,
      index: 1,
      metadata: {
        type: 'url',
        fieldName: 'domainName',
        placeHolder: 'example.com',
      },
      isVisible: true,
    } as ColumnDefinition<ViewFieldURLMetadata>,
    {
      key: 'accountOwner',
      name: 'Account Owner',
      Icon: IconUserCircle,
      size: 150,
      index: 2,
      metadata: {
        type: 'relation',
        fieldName: 'accountOwner',
        relationType: Entity.User,
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldRelationMetadata>,
    {
      key: 'createdAt',
      name: 'Creation',
      Icon: IconCalendarEvent,
      size: 150,
      index: 3,
      metadata: {
        type: 'date',
        fieldName: 'createdAt',
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldDateMetadata>,
    {
      key: 'employees',
      name: 'Employees',
      Icon: IconUsers,
      size: 150,
      index: 4,
      metadata: {
        type: 'number',
        fieldName: 'employees',
        isPositive: true,
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldNumberMetadata>,
    {
      key: 'linkedin',
      name: 'LinkedIn',
      Icon: IconBrandLinkedin,
      size: 170,
      index: 5,
      metadata: {
        type: 'url',
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn URL',
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
    {
      key: 'address',
      name: 'Address',
      Icon: IconMap,
      size: 170,
      index: 6,
      metadata: {
        type: 'text',
        fieldName: 'address',
        placeHolder: 'Addre​ss', // Hack: Fake character to prevent password-manager from filling the field
      },
      isVisible: true,
    } satisfies ColumnDefinition<ViewFieldTextMetadata>,
    {
      key: 'idealCustomerProfile',
      name: 'ICP',
      Icon: IconTarget,
      size: 150,
      index: 7,
      metadata: {
        type: 'boolean',
        fieldName: 'idealCustomerProfile',
      },
      isVisible: false,
    } satisfies ColumnDefinition<ViewFieldBooleanMetadata>,
    {
      key: 'annualRecurringRevenue',
      name: 'ARR',
      Icon: IconMoneybag,
      size: 150,
      index: 8,
      metadata: {
        type: 'moneyAmount',
        fieldName: 'annualRecurringRevenue',
      },
    } satisfies ColumnDefinition<ViewFieldMoneyMetadata>,
    {
      key: 'xUrl',
      name: 'Twitter',
      Icon: IconBrandX,
      size: 150,
      index: 9,
      metadata: {
        type: 'url',
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
      isVisible: false,
    } satisfies ColumnDefinition<ViewFieldURLMetadata>,
  ];
