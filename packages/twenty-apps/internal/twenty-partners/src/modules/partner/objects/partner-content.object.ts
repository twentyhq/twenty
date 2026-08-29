import { FieldType, defineObject } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_CONTENT_NAME_FIELD_ID =
  '9e688624-83d2-4715-8b18-80492a6de2b6';
export const PARTNER_CONTENT_TYPE_FIELD_ID =
  '1d926e6e-6ac1-4d60-ab3d-a73114005692';
export const PARTNER_CONTENT_STATUS_FIELD_ID =
  'a0fe09c4-c1f4-4b96-93c6-d7ec38f1166a';
export const PARTNER_CONTENT_APPROVAL_DATE_FIELD_ID =
  'b52d263e-423e-40b0-b82c-29214597c005';
export const PARTNER_CONTENT_INTERVIEW_FIELD_ID =
  'da7e9094-e2c3-47d3-924f-a1d4d3c717ed';
export const PARTNER_CONTENT_DOCUMENTS_FIELD_ID =
  'f303369e-288c-4a48-9920-c1de0ad9a159';
export const PARTNER_CONTENT_CLIENT_NAME_FIELD_ID =
  '3c430cee-c5db-4bd0-8380-a551e6ba4f19';
export const PARTNER_CONTENT_HEADLINE_FIELD_ID =
  '48937b8d-b8d6-4424-86f3-4ab18e83e9f5';
export const PARTNER_CONTENT_BODY_FIELD_ID =
  'fca9e56b-a9a6-40dc-a5e0-7a2611d3febb';
export const PARTNER_CONTENT_COVER_IMAGE_FIELD_ID =
  '6b1225d3-f666-4c7b-8309-ab95cd5f44ea';
export const PARTNER_CONTENT_COVER_IMAGE_URL_FIELD_ID =
  '1d87e6cb-0cbe-4010-96a3-25e891774c5e';
export const PARTNER_CONTENT_CASE_STUDY_LINK_FIELD_ID =
  '35e32a90-4df3-4741-b331-77ebdc8fdb80';
export const PARTNER_CONTENT_POSITION_FIELD_ID =
  '37e96b80-7387-5254-8be7-028a19cc5a1e';

export default defineObject({
  universalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'partnerContent',
  namePlural: 'partnerContents',
  labelSingular: 'Partner Content',
  labelPlural: 'Partner Content',
  description: 'Marketing content involving a partner: quotes, case studies, logos',
  icon: 'IconQuote',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier: PARTNER_CONTENT_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: PARTNER_CONTENT_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: PARTNER_CONTENT_TYPE_FIELD_ID,
      type: FieldType.MULTI_SELECT,
      name: 'contentType',
      label: 'Content Type',
      icon: 'IconCategory',
      isNullable: true,
      options: [
        { id: '07f85e5b-0d70-416b-9884-256e469ed532', value: 'CUSTOMER_QUOTE', label: 'Customer quote', position: 0, color: 'blue' },
        { id: '108b2358-d04d-4fdc-83df-a5978d39f66f', value: 'CASE_STUDY', label: 'Case study', position: 1, color: 'green' },
        { id: 'eb45f371-f93c-4c45-9c8a-f29e1a58b7e4', value: 'PARTNER_QUOTE', label: 'Partner quote', position: 2, color: 'orange' },
        { id: '3356c8a0-41cd-47c3-a293-5862138abc1a', value: 'LOGO', label: 'Logo', position: 3, color: 'purple' },
      ],
    },
    {
      universalIdentifier: PARTNER_CONTENT_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'WIP'",
      options: [
        { id: '5d41450b-8efb-41e8-81b7-b534429ec1b4', value: 'WIP', label: 'WIP', position: 0, color: 'gray' },
        { id: '6611ae9a-4253-4638-9c47-d8bf2ec54368', value: 'INTERVIEW_SCHEDULED', label: 'Interview scheduled', position: 1, color: 'blue' },
        { id: 'ae3d91e4-96ea-4687-b71f-d2d80088f28a', value: 'UNDER_CUSTOMER_PARTNER_REVIEW', label: 'Under review', position: 2, color: 'orange' },
        { id: '91fe48a3-7950-4cdd-8c52-8d9b2cc03f0b', value: 'APPROVED', label: 'Approved', position: 3, color: 'green' },
        { id: 'fa640b71-862e-4c64-80fa-37ab8b50d254', value: 'REJECTED', label: 'Rejected', position: 4, color: 'red' },
      ],
    },
    {
      universalIdentifier: PARTNER_CONTENT_APPROVAL_DATE_FIELD_ID,
      type: FieldType.DATE_TIME,
      name: 'approvalDate',
      label: 'Approval Date',
      icon: 'IconCalendarCheck',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNER_CONTENT_INTERVIEW_FIELD_ID,
      type: FieldType.LINKS,
      name: 'interview',
      label: 'Interview',
      icon: 'IconMicrophone',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNER_CONTENT_DOCUMENTS_FIELD_ID,
      type: FieldType.FILES,
      name: 'documents',
      label: 'Documents',
      icon: 'IconPaperclip',
      isNullable: true,
      universalSettings: { maxNumberOfValues: 10 },
    },
    {
      universalIdentifier: PARTNER_CONTENT_CLIENT_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'clientName',
      label: 'Client Name',
      icon: 'IconBuilding',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNER_CONTENT_HEADLINE_FIELD_ID,
      type: FieldType.TEXT,
      name: 'headline',
      label: 'Headline',
      icon: 'IconSparkles',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNER_CONTENT_BODY_FIELD_ID,
      type: FieldType.RICH_TEXT,
      name: 'body',
      label: 'Body',
      icon: 'IconFileText',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNER_CONTENT_COVER_IMAGE_FIELD_ID,
      type: FieldType.FILES,
      name: 'coverImage',
      label: 'Cover Image',
      icon: 'IconPhoto',
      isNullable: true,
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: PARTNER_CONTENT_COVER_IMAGE_URL_FIELD_ID,
      type: FieldType.TEXT,
      name: 'coverImageUrl',
      label: 'Cover Image URL',
      icon: 'IconPhoto',
      isNullable: true,
    },
    {
      universalIdentifier: PARTNER_CONTENT_CASE_STUDY_LINK_FIELD_ID,
      type: FieldType.LINKS,
      name: 'caseStudyLink',
      label: 'Case Study Link',
      icon: 'IconLink',
      isNullable: true,
    },
  ],
});
