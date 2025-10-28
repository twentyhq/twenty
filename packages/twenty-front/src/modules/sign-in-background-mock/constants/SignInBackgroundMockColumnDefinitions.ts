/* eslint-disable @nx/workspace-max-consts-per-file */
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { findByProperty } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

const COMPANY_MOCK_OBJECT = getMockCompanyObjectMetadataItem();

export const SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS = (
  [
    {
      position: 0,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'name'))?.id ??
        '',
      label: 'Name',
      size: 100,
      type: FieldMetadataType.TEXT,
      metadata: {
        fieldName: 'name',
        placeHolder: 'Name',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconBuildingSkyscraper',
      isVisible: true,
      defaultValue: '',
    },
    {
      position: 1,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'domainName'))
          ?.id ?? '',
      label: 'Domain Name',
      size: 100,
      type: FieldMetadataType.LINKS,
      metadata: {
        fieldName: 'domainName',
        placeHolder: 'Domain Name',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconLink',
      isVisible: true,
      defaultValue: '',
    },
    {
      position: 2,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'employees'))
          ?.id ?? '',
      label: 'Employees',
      size: 100,
      type: FieldMetadataType.NUMBER,
      metadata: {
        fieldName: 'employees',
        placeHolder: 'Employees',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconUsers',
      isVisible: true,
      defaultValue: 0,
    },
    {
      position: 3,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'people'))?.id ??
        '',
      label: 'People',
      size: 100,
      type: FieldMetadataType.RELATION,
      metadata: {
        fieldName: 'people',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconUsers',
      isVisible: true,
      defaultValue: [],
    },
    {
      position: 4,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'address'))
          ?.id ?? '',
      label: 'Address',
      size: 100,
      type: FieldMetadataType.ADDRESS,
      metadata: {
        fieldName: 'address',
        placeHolder: 'Address',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconMap',
      isVisible: true,
      defaultValue: '',
    },
    {
      position: 5,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'accountOwner'))
          ?.id ?? '',
      label: 'Account Owner',
      size: 100,
      type: FieldMetadataType.RELATION,
      metadata: {
        fieldName: 'accountOwner',
        relationType: RelationType.MANY_TO_ONE,
        relationObjectMetadataNameSingular: 'workspaceMember',
        relationObjectMetadataNamePlural: 'workspaceMembers',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconUserCircle',
      isVisible: true,
      defaultValue: null,
    },
    {
      position: 6,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'attachments'))
          ?.id ?? '',
      label: 'Attachments',
      size: 100,
      type: FieldMetadataType.RELATION,
      metadata: {
        fieldName: 'attachments',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconFileImport',
      isVisible: true,
      defaultValue: [],
    },
    {
      position: 7,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'createdAt'))
          ?.id ?? '',
      label: 'Creation date',
      size: 100,
      type: FieldMetadataType.DATE_TIME,
      metadata: {
        fieldName: 'createdAt',
        placeHolder: 'Creation date',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconCalendar',
      isVisible: true,
      defaultValue: '',
    },
    {
      position: 8,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(
          findByProperty('name', 'idealCustomerProfile'),
        )?.id ?? '',
      label: 'ICP',
      size: 100,
      type: FieldMetadataType.BOOLEAN,
      metadata: {
        fieldName: 'idealCustomerProfile',
        placeHolder: 'ICP',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconTarget',
      isVisible: true,
      defaultValue: false,
    },
    {
      position: 9,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'linkedinLink'))
          ?.id ?? '',
      label: 'Linkedin',
      size: 100,
      type: FieldMetadataType.LINKS,
      metadata: {
        fieldName: 'linkedinLink',
        placeHolder: 'Linkedin',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconBrandLinkedin',
      isVisible: true,
      defaultValue: '',
    },
    {
      position: 10,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'opportunities'))
          ?.id ?? '',
      label: 'Opportunities',
      size: 100,
      type: FieldMetadataType.RELATION,
      metadata: {
        fieldName: 'opportunities',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconTargetArrow',
      isVisible: true,
      defaultValue: [],
    },
    {
      position: 11,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'xLink'))?.id ??
        '',
      label: 'X',
      size: 100,
      type: FieldMetadataType.LINKS,
      metadata: {
        fieldName: 'xLink',
        placeHolder: 'X',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconBrandX',
      isVisible: true,
      defaultValue: '',
    },
    {
      position: 12,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(
          findByProperty('name', 'activityTargets'),
        )?.id ?? '',
      label: 'Activities',
      size: 100,
      type: FieldMetadataType.RELATION,
      metadata: {
        fieldName: 'activityTargets',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconCheckbox',
      isVisible: true,
      defaultValue: [],
    },
    {
      position: 13,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(
          findByProperty('name', 'annualRecurringRevenue'),
        )?.id ?? '',
      label: 'ARR',
      size: 100,
      type: FieldMetadataType.CURRENCY,
      metadata: {
        fieldName: 'annualRecurringRevenue',
        placeHolder: 'ARR',
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconMoneybag',
      isVisible: true,
      defaultValue: 0,
    },
    {
      position: 14,
      fieldMetadataId:
        COMPANY_MOCK_OBJECT.fields.find(findByProperty('name', 'favorites'))
          ?.id ?? '',
      label: 'Favorites',
      size: 100,
      type: FieldMetadataType.RELATION,
      metadata: {
        fieldName: 'favorites',
        relationType: RelationType.ONE_TO_MANY,
        relationObjectMetadataNameSingular: '',
        relationObjectMetadataNamePlural: '',
        objectMetadataNameSingular: 'company',
      },
      iconName: 'IconHeart',
      isVisible: true,
      defaultValue: [],
    },
  ] satisfies ColumnDefinition<FieldMetadata>[]
).filter(filterAvailableTableColumns);
