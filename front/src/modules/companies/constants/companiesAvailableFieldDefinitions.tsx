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
      fieldMetadataId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      size: 180,
      position: 0,
      type: 'CHIP',
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
      fieldMetadataId: 'domainName',
      label: 'URL',
      Icon: IconLink,
      size: 100,
      position: 1,
      type: 'URL',
      metadata: {
        fieldName: 'domainName',
        placeHolder: 'example.com',
      },
      isVisible: true,
      infoTooltipContent:
        'The company website URL. We use this url to fetch the company icon.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
    {
      fieldMetadataId: 'accountOwner',
      label: 'Account Owner',
      Icon: IconUserCircle,
      size: 150,
      position: 2,
      type: 'RELATION',
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
      fieldMetadataId: 'createdAt',
      label: 'Creation',
      Icon: IconCalendarEvent,
      size: 150,
      position: 3,
      type: 'DATE',
      metadata: {
        fieldName: 'createdAt',
      },
      isVisible: true,
      infoTooltipContent: "Date when the company's record was created.",
    } satisfies ColumnDefinition<FieldDateMetadata>,
    {
      fieldMetadataId: 'employees',
      label: 'Employees',
      Icon: IconUsers,
      size: 150,
      position: 4,
      type: 'NUMBER',
      metadata: {
        fieldName: 'employees',
        isPositive: true,
        placeHolder: 'Employees',
      },
      isVisible: true,
      infoTooltipContent: 'Number of employees in the company.',
    } satisfies ColumnDefinition<FieldNumberMetadata>,
    {
      fieldMetadataId: 'linkedin',
      label: 'LinkedIn',
      Icon: IconBrandLinkedin,
      size: 170,
      position: 5,
      type: 'URL',
      metadata: {
        fieldName: 'linkedinUrl',
        placeHolder: 'LinkedIn URL',
      },
      isVisible: true,
      infoTooltipContent: 'The company Linkedin account.',
    } satisfies ColumnDefinition<FieldURLMetadata>,
    {
      fieldMetadataId: 'address',
      label: 'Address',
      Icon: IconMap,
      size: 170,
      position: 6,
      type: 'TEXT',
      metadata: {
        fieldName: 'address',
        placeHolder: 'Addre​ss', // Hack: Fake character to prevent password-manager from filling the field
      },
      isVisible: true,
      infoTooltipContent: 'The company address.',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      fieldMetadataId: 'idealCustomerProfile',
      label: 'ICP',
      Icon: IconTarget,
      size: 150,
      position: 7,
      type: 'BOOLEAN',
      metadata: {
        fieldName: 'idealCustomerProfile',
      },
      isVisible: false,
      infoTooltipContent:
        'Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you.',
    } satisfies ColumnDefinition<FieldBooleanMetadata>,
    {
      fieldMetadataId: 'annualRecurringRevenue',
      label: 'ARR',
      Icon: IconMoneybag,
      size: 150,
      position: 8,
      type: 'MONEY_AMOUNT',
      metadata: {
        fieldName: 'annualRecurringRevenue',
        placeHolder: 'ARR',
      },
      infoTooltipContent:
        'Annual Recurring Revenue: The actual or estimated annual revenue of the company.',
    } satisfies ColumnDefinition<FieldMoneyMetadata>,
    {
      fieldMetadataId: 'xUrl',
      label: 'Twitter',
      Icon: IconBrandX,
      size: 150,
      position: 9,
      type: 'URL',
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
      fieldMetadataId: 'name',
      label: 'Name',
      Icon: IconBuildingSkyscraper,
      size: 180,
      position: 0,
      type: 'TEXT',
      metadata: {
        fieldName: 'name',
        placeHolder: 'Company Name',
      },
      isVisible: true,
      infoTooltipContent: 'The company name.',
      basePathToShowPage: '/companies/',
    } satisfies ColumnDefinition<FieldTextMetadata>,
    {
      fieldMetadataId: 'city',
      label: 'City',
      Icon: IconBuildingSkyscraper,
      size: 180,
      position: 0,
      type: 'TEXT',
      metadata: {
        fieldName: 'city',
        placeHolder: 'Company Name',
      },
      isVisible: true,
      infoTooltipContent: 'The company name.',
      basePathToShowPage: '/companies/',
    } satisfies ColumnDefinition<FieldTextMetadata>,
  ];
