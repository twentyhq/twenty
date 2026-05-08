import { defineObject, FieldType } from 'twenty-sdk/define';

export const INFLUENCER_PROSPECT_OBJECT_ID = '03691c3a-de60-48d8-a15b-be6600bad580';
export const INFLUENCER_PROSPECT_NAME_FIELD_ID = '3e8bbad0-2f47-47d6-906f-fdcf0f7f84bf';
export const INFLUENCER_PROSPECT_STAGE_FIELD_ID = '12ee84f9-610e-4e88-bf3c-e2740238f918';

export default defineObject({
  universalIdentifier: INFLUENCER_PROSPECT_OBJECT_ID,
  nameSingular: 'influencerProspect',
  namePlural: 'influencerProspects',
  labelSingular: 'Influencer Prospect',
  labelPlural: 'Influencer Prospects',
  description: 'Prospecting database for creators and potential ambassadors.',
  icon: 'IconBrandInstagram',
  labelIdentifierFieldMetadataUniversalIdentifier: INFLUENCER_PROSPECT_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: INFLUENCER_PROSPECT_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconUser' },
    { universalIdentifier: 'eef85b81-2b51-4444-9f2c-b76a6317baf9', type: FieldType.TEXT, name: 'handle', label: 'Handle', icon: 'IconAt' },
    {
      universalIdentifier: '3e3a1b88-229c-4089-997f-03a64142e8cd',
      type: FieldType.SELECT,
      name: 'platform',
      label: 'Platform',
      icon: 'IconShare',
      defaultValue: "'INSTAGRAM'",
      options: [
        { id: '5c7bcb3e-943d-4a15-94c4-8af6a7c1a111', value: 'INSTAGRAM', label: 'Instagram', position: 0, color: 'purple' },
        { id: '5f38e30a-c087-4468-a10e-6f2ed6d4d7f2', value: 'TIKTOK', label: 'TikTok', position: 1, color: 'gray' },
        { id: 'ff2773cb-9e21-4d0b-9e5f-fdc26ea513e0', value: 'YOUTUBE', label: 'YouTube', position: 2, color: 'red' },
        { id: 'eb73cde1-2bb5-4960-9e63-6b6797d3e953', value: 'OTHER', label: 'Other', position: 3, color: 'gray' },
      ],
    },
    { universalIdentifier: '6ebfdc74-4197-4c36-9ac5-a446bc50ecee', type: FieldType.EMAILS, name: 'emails', label: 'Emails', icon: 'IconMail' },
    { universalIdentifier: 'a8d4f614-748c-4748-8c8e-1b9f9e499f85', type: FieldType.NUMBER, name: 'followerCount', label: 'Followers', icon: 'IconUsers', defaultValue: 0 },
    { universalIdentifier: 'f1cf9e44-6f1f-4270-a50e-f22167b583bb', type: FieldType.NUMBER, name: 'engagementRate', label: 'Engagement rate %', icon: 'IconPercentage', defaultValue: 0 },
    {
      universalIdentifier: INFLUENCER_PROSPECT_STAGE_FIELD_ID,
      type: FieldType.SELECT,
      name: 'stage',
      label: 'Stage',
      icon: 'IconProgress',
      defaultValue: "'NEW'",
      options: [
        { id: '774845e9-6d99-4b06-8ae7-559a7e897de7', value: 'NEW', label: 'New', position: 0, color: 'gray' },
        { id: '0f80e664-7f94-48d2-99fe-70a12125f723', value: 'RESEARCHING', label: 'Researching', position: 1, color: 'yellow' },
        { id: '53428235-9698-4570-8523-318a77f14d92', value: 'ENRICHED', label: 'Enriched', position: 2, color: 'blue' },
        { id: '2196bc49-5e37-4749-8790-f41ac47bcc92', value: 'SEQUENCED', label: 'Sequenced', position: 3, color: 'purple' },
        { id: '65985807-602a-4479-8174-4d909c993128', value: 'INVITED', label: 'Invited', position: 4, color: 'green' },
        { id: 'de75b62b-cdd2-4e5c-97d4-e6eef1ea958d', value: 'DISQUALIFIED', label: 'Disqualified', position: 5, color: 'red' },
      ],
    },
    { universalIdentifier: 'c79a4034-f493-43fb-8096-df43e90ac21b', type: FieldType.NUMBER, name: 'priorityScore', label: 'Priority score', icon: 'IconGauge', defaultValue: 0 },
    { universalIdentifier: 'e924c267-6a72-49e6-a034-dc7cd364f8a6', type: FieldType.TEXT, name: 'sequenceName', label: 'Sequence name', icon: 'IconSend' },
    { universalIdentifier: 'c454ebf9-bf05-4c6f-944f-2dd9b9246150', type: FieldType.TEXT, name: 'researchSummary', label: 'Research summary', icon: 'IconNotes' },
  ],
});
