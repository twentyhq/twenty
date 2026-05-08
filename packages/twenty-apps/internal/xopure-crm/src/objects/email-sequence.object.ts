import { defineObject, FieldType } from 'twenty-sdk/define';

export const EMAIL_SEQUENCE_OBJECT_ID = '09310113-d7dc-4faa-8e4a-a6e7c4b7f9bd';
export const EMAIL_SEQUENCE_NAME_FIELD_ID = '65d8d96e-285b-4211-8f4e-4a4d91226484';

export default defineObject({
  universalIdentifier: EMAIL_SEQUENCE_OBJECT_ID,
  nameSingular: 'xopureEmailSequence',
  namePlural: 'xopureEmailSequences',
  labelSingular: 'Email Sequence',
  labelPlural: 'Email Sequences',
  description: 'Reusable outreach and lifecycle email sequences attached to CRM triggers.',
  icon: 'IconMailForward',
  labelIdentifierFieldMetadataUniversalIdentifier: EMAIL_SEQUENCE_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: EMAIL_SEQUENCE_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconMail' },
    {
      universalIdentifier: '9f577c45-d758-4457-8900-ee257cc3b90b',
      type: FieldType.SELECT,
      name: 'audience',
      label: 'Audience',
      icon: 'IconUsersGroup',
      defaultValue: "'CUSTOMER'",
      options: [
        { id: '587b9706-7f1d-434d-a3d7-652c49f3a8f7', value: 'CUSTOMER', label: 'Customer', position: 0, color: 'green' },
        { id: 'f6e8bdd7-dac7-4d12-9970-2e7c4c5cffba', value: 'AMBASSADOR', label: 'Ambassador', position: 1, color: 'blue' },
        { id: '47aa43ed-8396-4e6e-b4d5-24619d806fd8', value: 'RETAIL_PROSPECT', label: 'Retail prospect', position: 2, color: 'yellow' },
        { id: '2104e68e-dc7f-4e87-9423-349d4efa81b1', value: 'INFLUENCER_PROSPECT', label: 'Influencer prospect', position: 3, color: 'purple' },
      ],
    },
    {
      universalIdentifier: 'c575bcfd-4cb7-4132-a71f-38b514696ec9',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'DRAFT'",
      options: [
        { id: 'b3d4b276-39d6-49a4-9d72-2ee3a0a0f016', value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
        { id: '72f0578f-733c-4c8d-9153-07d9dc6e693b', value: 'ACTIVE', label: 'Active', position: 1, color: 'green' },
        { id: '476a1d92-c01f-4541-9f5f-f6d1b743d5a1', value: 'PAUSED', label: 'Paused', position: 2, color: 'orange' },
        { id: '9ae9dd87-6e73-4572-a673-873e87051f06', value: 'ARCHIVED', label: 'Archived', position: 3, color: 'red' },
      ],
    },
    { universalIdentifier: 'b4808364-c426-44de-b89b-d231a89d1970', type: FieldType.TEXT, name: 'triggerEvent', label: 'Trigger event', icon: 'IconBolt' },
    { universalIdentifier: '7b0e23ad-fcc7-4543-888a-9d31eb212d59', type: FieldType.NUMBER, name: 'stepCount', label: 'Step count', icon: 'IconListNumbers', defaultValue: 0 },
    { universalIdentifier: 'a6b58aa7-2730-4c5e-9cb6-4aa19f508848', type: FieldType.TEXT, name: 'owner', label: 'Owner', icon: 'IconUserCog' },
  ],
});
