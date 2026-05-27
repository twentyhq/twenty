import { FieldType, defineObject } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'partnerContent',
  namePlural: 'partnerContents',
  labelSingular: 'Partner Content',
  labelPlural: 'Partner Content',
  description: 'Marketing content involving a partner: quotes, case studies, logos',
  icon: 'IconQuote',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier: '9e688624-83d2-4715-8b18-80492a6de2b6',
  fields: [
    {
      universalIdentifier: '9e688624-83d2-4715-8b18-80492a6de2b6',
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTag',
      defaultValue: "''",
    },
    {
      universalIdentifier: '1d926e6e-6ac1-4d60-ab3d-a73114005692',
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
      universalIdentifier: 'a0fe09c4-c1f4-4b96-93c6-d7ec38f1166a',
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
      universalIdentifier: 'b52d263e-423e-40b0-b82c-29214597c005',
      type: FieldType.DATE_TIME,
      name: 'approvalDate',
      label: 'Approval Date',
      icon: 'IconCalendarCheck',
      isNullable: true,
    },
    {
      universalIdentifier: 'da7e9094-e2c3-47d3-924f-a1d4d3c717ed',
      type: FieldType.LINKS,
      name: 'interview',
      label: 'Interview',
      icon: 'IconMicrophone',
      isNullable: true,
    },
    {
      universalIdentifier: 'f303369e-288c-4a48-9920-c1de0ad9a159',
      type: FieldType.FILES,
      name: 'documents',
      label: 'Documents',
      icon: 'IconPaperclip',
      isNullable: true,
      universalSettings: { maxNumberOfValues: 10 },
    },
  ],
});
