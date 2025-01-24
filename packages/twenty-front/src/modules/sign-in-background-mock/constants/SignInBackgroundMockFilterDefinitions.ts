import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';

export const SIGN_IN_BACKGROUND_MOCK_FILTER_DEFINITIONS = [
  {
    fieldMetadataId: '20202020-5e4e-4007-a630-8a2617914889',
    label: 'Domain Name',
    iconName: 'IconLink',
    type: 'LINKS',
  },
  {
    fieldMetadataId: '20202020-7fbd-41ad-b64d-25a15ff62f04',
    label: 'Employees',
    iconName: 'IconUsers',
    type: 'NUMBER',
  },
  {
    fieldMetadataId: 'REPLACE_ME',
    label: 'Name',
    iconName: 'IconBuildingSkyscraper',
    type: 'TEXT',
  },
  {
    fieldMetadataId: '20202020-ad10-4117-a039-3f04b7a5f939',
    label: 'Address',
    iconName: 'IconMap',
    type: 'ADDRESS',
  },
  {
    fieldMetadataId: '20202020-0739-495d-8e70-c0807f6b2268',
    label: 'Account Owner',
    iconName: 'IconUserCircle',
    relationObjectMetadataNamePlural: 'workspaceMembers',
    relationObjectMetadataNameSingular: 'workspaceMember',
    type: 'RELATION',
  },
  {
    fieldMetadataId: '20202020-4dc2-47c9-bb15-6e6f19ba9e46',
    label: 'Creation date',
    iconName: 'IconCalendar',
    type: 'DATE_TIME',
  },
  {
    fieldMetadataId: '20202020-a61d-4b78-b998-3fd88b4f73a1',
    label: 'Linkedin',
    iconName: 'IconBrandLinkedin',
    type: 'LINKS',
  },
  {
    fieldMetadataId: '20202020-46e3-479a-b8f4-77137c74daa6',
    label: 'X',
    iconName: 'IconBrandX',
    type: 'LINKS',
  },
  {
    fieldMetadataId: '20202020-4a5a-466f-92d9-c3870d9502a9',
    label: 'ARR',
    iconName: 'IconMoneybag',
    type: 'CURRENCY',
  },
] as RecordFilterDefinition[];
