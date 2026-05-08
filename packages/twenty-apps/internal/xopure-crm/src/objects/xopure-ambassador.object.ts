import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_AMBASSADOR_OBJECT_ID = 'edcc4b8c-e7eb-4d71-9c09-c2a46bb7b334';
export const XOPURE_AMBASSADOR_NAME_FIELD_ID = '2e504ddb-eee1-4ce2-af0b-8dc9b0df3e04';
export const XOPURE_AMBASSADOR_LEVEL_FIELD_ID = '1e0f5ff7-5e98-414c-9a2a-09260d916bbc';
export const XOPURE_AMBASSADOR_STATUS_FIELD_ID = '88af418d-b7af-419e-a546-42fd1a92fc08';

export default defineObject({
  universalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  nameSingular: 'xopureAmbassador',
  namePlural: 'xopureAmbassadors',
  labelSingular: 'XO Pure Ambassador',
  labelPlural: 'XO Pure Ambassadors',
  description: 'Ambassador lifecycle, level, codes, attribution, and payout context.',
  icon: 'IconRosetteDiscountCheck',
  labelIdentifierFieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: XOPURE_AMBASSADOR_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconUserStar' },
    { universalIdentifier: 'f6f2230e-f5a8-4472-bd05-3f7bfc1f928b', type: FieldType.TEXT, name: 'supabaseAmbassadorId', label: 'Supabase ambassador ID', icon: 'IconDatabase' },
    {
      universalIdentifier: XOPURE_AMBASSADOR_LEVEL_FIELD_ID,
      type: FieldType.SELECT,
      name: 'level',
      label: 'Ambassador level',
      icon: 'IconAward',
      defaultValue: "'SEED'",
      options: [
        { id: 'f39fbfbf-fb2e-4395-9d6c-edca4047863f', value: 'SEED', label: 'Seed', position: 0, color: 'gray' },
        { id: '3ca0b660-31b2-4c9c-8b83-165bd2ca5483', value: 'BRONZE', label: 'Bronze', position: 1, color: 'orange' },
        { id: '0c321dd0-3432-4d34-af27-55e01e50c772', value: 'SILVER', label: 'Silver', position: 2, color: 'gray' },
        { id: '28671201-8a9c-4303-85b4-e4cc225ae437', value: 'GOLD', label: 'Gold', position: 3, color: 'yellow' },
        { id: '7435e69e-b59b-4526-adae-c13039b34e07', value: 'PLATINUM', label: 'Platinum', position: 4, color: 'blue' },
        { id: '977459f9-18d1-472c-bb47-9377b0711963', value: 'ELITE', label: 'Elite', position: 5, color: 'purple' },
      ],
    },
    {
      universalIdentifier: XOPURE_AMBASSADOR_STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'APPLIED'",
      options: [
        { id: '5a034214-9ef6-402d-951e-b6d5536a393d', value: 'APPLIED', label: 'Applied', position: 0, color: 'yellow' },
        { id: 'fe69a60c-311f-4f89-82f4-54a11d839b84', value: 'APPROVED', label: 'Approved', position: 1, color: 'green' },
        { id: '507d047b-33d0-4bff-87e0-4795286365ee', value: 'ACTIVE', label: 'Active', position: 2, color: 'blue' },
        { id: '7f73ed3d-9ab6-41b7-b575-3c89847a804a', value: 'PAUSED', label: 'Paused', position: 3, color: 'orange' },
        { id: '925ad08a-cbc5-48bb-8ac7-faab1fc11de2', value: 'REJECTED', label: 'Rejected', position: 4, color: 'red' },
      ],
    },
    { universalIdentifier: 'e6772271-9b15-484e-8f74-8a1566b4ff47', type: FieldType.TEXT, name: 'referralCode', label: 'Referral code', icon: 'IconTicket' },
    { universalIdentifier: '1bdfadb7-f157-4c2f-9b39-b735c1d71b9a', type: FieldType.NUMBER, name: 'commissionRate', label: 'Commission rate %', icon: 'IconPercentage', defaultValue: 0 },
    { universalIdentifier: '6cdfdeac-23c4-4bb1-b61c-e2ed179b25ba', type: FieldType.NUMBER, name: 'attributedRevenue', label: 'Attributed revenue', icon: 'IconCurrencyDollar', defaultValue: 0 },
    { universalIdentifier: 'a38232d0-4679-46f5-950a-6d6000ed7221', type: FieldType.NUMBER, name: 'totalCommissionEarned', label: 'Commission earned', icon: 'IconCash', defaultValue: 0 },
    { universalIdentifier: '0de23b2b-a89b-4180-96e5-5c70cb6c6c5b', type: FieldType.TEXT, name: 'researchSummary', label: 'Research summary', icon: 'IconNotes' },
  ],
});
