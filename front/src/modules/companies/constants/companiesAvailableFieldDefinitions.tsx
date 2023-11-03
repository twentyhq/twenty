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
} from '@/ui/display/icon/index';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import {
  FieldBooleanMetadata,
  FieldChipMetadata,
  FieldDateMetadata,
  FieldMetadata,
  FieldMoneyMetadata,
  FieldNumberMetadata,
  FieldRelationMetadata,
  FieldTextMetadata,
  FieldURLMetadata,
} from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { User } from '~/generated/graphql';

export const companiesAvailableFieldDefinitions: ColumnDefinition<FieldMetadata>[] =
  [
    {
      fieldId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      size: 180,
      position: 0,
      type: 'chip',
      metadata: {
        urlFieldName: 'domainName',
        contentFieldName: 'name',
        relationType: Entity.Company,
        placeHolder: 'Company Name',
      },
      isVisible: true,
      infoTooltipContent: 'The company name.',
      basePathToShowPage: '/companies/',
    } satisfies ColumnDefinition<FieldChipMetadata>,
    {
      fieldId: 'domainName',
      label: 'URL',
      Icon: IconLink,
      size: 100,
      position: 1,
      type: 'url',
      metadata: {
        fieldName: 'domainName',
        placeHolder: 'example.com',
      },
      isVisible: true,
      infoTooltipContent:
        'The company website URL. We use this url to fetch the company icon.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
    {
      fieldId: 'accountOwner',
      label: 'Account Owner',
      Icon: IconUserCircle,
      size: 150,
      position: 2,
      type: 'relation',
      metadata: {
        fieldName: 'accountOwner',
        relationType: Entity.User,
      },
      isVisible: true,
      infoTooltipContent:
        'Your team member responsible for managing the company account.',
      entityChipDisplayMapper: (dataObject: User) => {
        return {
          name: dataObject?.displayName,
          pictureUrl: dataObject?.avatarUrl ?? undefined,
          avatarType: 'rounded',
        };
      },
    } satisfies ColumnDefinition<FieldRelationMetadata>,
    {
      fieldId: 'createdAt',
      label: 'Creation',
      Icon: IconCalendarEvent,
      size: 150,
      position: 3,
      type: 'date',
      metadata: {
        fieldName: 'createdAt',
      },
      isVisible: true,
      infoTooltipContent: "Date when the company's record was created.",
    } satisfies ColumnDefinition<FieldDateMetadata>,
    {
      fieldId: 'employees',
      label: 'Employees',
      Icon: IconUsers,
      size: 150,
      position: 4,
      type: 'number',
      metadata: {
        fieldName: 'employees',
        isPositive: true,
        placeHolder: 'Employees',
      },
      isVisible: true,
      infoTooltipContent: 'Number of employees in the company.',
    } satisfies ColumnDefinition<FieldNumberMetadata>,
    {
      fieldId: 'linkedin',
      label: 'LinkedIn',
      Icon: IconBrandLinkedin,
      size: 170,
      position: 5,
      type: 'url',
      metadata: {
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn URL',
      },
      isVisible: true,
      infoTooltipContent: 'The company Linkedin account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
    {
      fieldId: 'address',
      label: 'Address',
      Icon: IconMap,
      size: 170,
      position: 6,
      type: 'text',
      metadata: {
        fieldName: 'address',
        placeHolder: 'Addre​ss', // Hack: Fake character to prevent password-manager from filling the field
      },
      isVisible: true,
      infoTooltipContent: 'The company address.',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      fieldId: 'idealCustomerProfile',
      label: 'ICP',
      Icon: IconTarget,
      size: 150,
      position: 7,
      type: 'boolean',
      metadata: {
        fieldName: 'idealCustomerProfile',
      },
      isVisible: false,
      infoTooltipContent:
        'Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you.',
    } satisfies ColumnDefinition<FieldBooleanMetadata>,
    {
      fieldId: 'annualRecurringRevenue',
      label: 'ARR',
      Icon: IconMoneybag,
      size: 150,
      position: 8,
      type: 'moneyAmount',
      metadata: {
        fieldName: 'annualRecurringRevenue',
        placeHolder: 'ARR',
      },
      infoTooltipContent:
        'Annual Recurring Revenue: The actual or estimated annual revenue of the company.',
    } satisfies ColumnDefinition<FieldMoneyMetadata>,
    {
      fieldId: 'xUrl',
      label: 'Twitter',
      Icon: IconBrandX,
      size: 150,
      position: 9,
      type: 'url',
      metadata: {
        fieldName: 'xUrl',
        placeHolder: 'X',
      },
      isVisible: false,
      infoTooltipContent: 'The company Twitter account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
  ];

export const suppliersAvailableColumnDefinitions: ColumnDefinition<FieldMetadata>[] =
  [
    {
      fieldId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      size: 180,
      position: 0,
      type: 'text',
      metadata: {
        fieldName: 'name',
        placeHolder: 'Company Name',
      },
      isVisible: true,
      infoTooltipContent: 'The company name.',
      basePathToShowPage: '/companies/',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      fieldId: 'city',
      label: 'City',
      Icon: IconBuildingSkyscraper,
      size: 180,
      position: 0,
      type: 'text',
      metadata: {
        fieldName: 'city',
        placeHolder: 'Company Name',
      },
      isVisible: true,
      infoTooltipContent: 'The company name.',
      basePathToShowPage: '/companies/',
    } satisfies ColumnDefinition<FieldTextMetadata>,
  ];
