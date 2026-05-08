import { defineObject, FieldType } from 'twenty-sdk/define';

export const RETAIL_PROSPECT_OBJECT_ID = '825889cb-31fa-4b24-b85b-fcd60e18df2e';
export const RETAIL_PROSPECT_NAME_FIELD_ID = 'b0f3bc43-683a-429c-92f2-dafc85baabff';
export const RETAIL_PROSPECT_STAGE_FIELD_ID = '1a4b7086-6adc-450f-a616-d479fe6fe162';

export default defineObject({
  universalIdentifier: RETAIL_PROSPECT_OBJECT_ID,
  nameSingular: 'retailProspect',
  namePlural: 'retailProspects',
  labelSingular: 'Retail Prospect',
  labelPlural: 'Retail Prospects',
  description: 'Prospecting database for retail, wholesale, and store opportunities.',
  icon: 'IconBuildingStore',
  labelIdentifierFieldMetadataUniversalIdentifier: RETAIL_PROSPECT_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: RETAIL_PROSPECT_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Prospect name', icon: 'IconBuildingStore' },
    { universalIdentifier: '37c5c410-9099-44ad-96b3-e12c726df987', type: FieldType.TEXT, name: 'companyName', label: 'Company name', icon: 'IconBuilding' },
    { universalIdentifier: '18c64a4b-8a6c-4d26-ad14-b6f3df759bba', type: FieldType.EMAILS, name: 'emails', label: 'Emails', icon: 'IconMail' },
    { universalIdentifier: 'f65f5ae8-7555-4c1c-885f-18f8372b1e5a', type: FieldType.PHONES, name: 'phones', label: 'Phones', icon: 'IconPhone' },
    { universalIdentifier: '7bb181c2-dcff-4a6c-a05d-8735896ba003', type: FieldType.LINKS, name: 'website', label: 'Website', icon: 'IconWorld' },
    {
      universalIdentifier: RETAIL_PROSPECT_STAGE_FIELD_ID,
      type: FieldType.SELECT,
      name: 'stage',
      label: 'Stage',
      icon: 'IconProgress',
      defaultValue: "'NEW'",
      options: [
        { id: '2f378613-eb73-48fa-bbc1-739a63f4a687', value: 'NEW', label: 'New', position: 0, color: 'gray' },
        { id: '125ce7b4-8c97-45b3-9f14-a3b55125058f', value: 'RESEARCHING', label: 'Researching', position: 1, color: 'yellow' },
        { id: '7a5cce3c-bef0-4672-8e9b-498c1e41bd7d', value: 'ENRICHED', label: 'Enriched', position: 2, color: 'blue' },
        { id: 'a1a5daa3-165f-48b1-a2d7-8dc60c282c8d', value: 'SEQUENCED', label: 'Sequenced', position: 3, color: 'purple' },
        { id: 'a11001c8-c486-49c2-88f3-92b96ce4354a', value: 'QUALIFIED', label: 'Qualified', position: 4, color: 'green' },
        { id: 'da6cf83e-10fd-474d-99e5-4b570b17975d', value: 'DISQUALIFIED', label: 'Disqualified', position: 5, color: 'red' },
      ],
    },
    { universalIdentifier: 'c7b6dac4-d540-42a9-a010-bbeeabde20d6', type: FieldType.NUMBER, name: 'priorityScore', label: 'Priority score', icon: 'IconGauge', defaultValue: 0 },
    { universalIdentifier: '29b04022-c9fb-466b-bc0d-08f2c10dd467', type: FieldType.TEXT, name: 'sequenceName', label: 'Sequence name', icon: 'IconSend' },
    { universalIdentifier: 'b91466b2-d11c-4953-bbb4-0d5f78160d33', type: FieldType.DATE_TIME, name: 'nextFollowUpAt', label: 'Next follow-up at', icon: 'IconCalendarDue', isNullable: true, defaultValue: null },
    { universalIdentifier: 'ec525396-aaeb-4217-973b-30a2a0cb6d0e', type: FieldType.TEXT, name: 'researchSummary', label: 'Research summary', icon: 'IconNotes' },
  ],
});
