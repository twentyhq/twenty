import { FieldType, defineObject } from 'twenty-sdk/define';

import { PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineObject({
  universalIdentifier: PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'partnerQuote',
  namePlural: 'partnerQuotes',
  labelSingular: 'Partner Quote',
  labelPlural: 'Partner Quotes',
  description: 'A quote a partner submitted for a customer deal',
  icon: 'IconFileDollar',
  isSearchable: true,
  labelIdentifierFieldMetadataUniversalIdentifier: '9e688624-83d2-4715-8b18-80492a6de2b6',
  fields: [
    {
      universalIdentifier: '9e688624-83d2-4715-8b18-80492a6de2b6',
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      defaultValue: "''",
    },
    {
      universalIdentifier: 'a0fe09c4-c1f4-4b96-93c6-d7ec38f1166a',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
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
      isNullable: true,
    },
    {
      universalIdentifier: '2cbe67e3-24ec-421b-bab5-50f3306c2391',
      type: FieldType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      isNullable: true,
    },
  ],
});
