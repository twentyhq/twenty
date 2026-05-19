import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID =
  '857eeffc-f6ca-4515-8380-916953f5fd95';
export const XOPURE_REFERRAL_RELATIONSHIP_NAME_FIELD_ID =
  'ca57e8ba-b78a-4b45-9c7e-0d1b6bce13e1';

export default defineObject({
  universalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  nameSingular: 'xopureReferralRelationship',
  namePlural: 'xopureReferralRelationships',
  labelSingular: 'XO Pure Referral Relationship',
  labelPlural: 'XO Pure Referral Relationships',
  description:
    'Ambassador referral genealogy for tree visualization and lineage tracking.',
  icon: 'IconTopologyStarRing3',
  labelIdentifierFieldMetadataUniversalIdentifier:
    XOPURE_REFERRAL_RELATIONSHIP_NAME_FIELD_ID,
  fields: [
    {
      universalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconTopologyStarRing3',
    },
    {
      universalIdentifier: '181faf6a-53b2-438d-9a3f-4379f1c73685',
      type: FieldType.TEXT,
      name: 'sponsorAmbassadorExternalId',
      label: 'Sponsor ambassador ID',
      icon: 'IconUserStar',
    },
    {
      universalIdentifier: '55d2dec8-d549-4f2b-a615-0cdb00e7b268',
      type: FieldType.TEXT,
      name: 'sponsoredAmbassadorExternalId',
      label: 'Sponsored ambassador ID',
      icon: 'IconUser',
    },
    {
      universalIdentifier: '061c1ddc-c40e-4e9a-8254-5fc1679d69d8',
      type: FieldType.TEXT,
      name: 'sponsorName',
      label: 'Sponsor name',
      icon: 'IconUserStar',
    },
    {
      universalIdentifier: 'd4f5a6b7-8901-4def-abc0-4567890123d4',
      type: FieldType.TEXT,
      name: 'sponsoredName',
      label: 'Sponsored name',
      icon: 'IconUser',
    },
    {
      universalIdentifier: 'e5a6b7c8-9012-4efa-bcd0-5678901234e5',
      type: FieldType.NUMBER,
      name: 'depth',
      label: 'Depth',
      icon: 'IconNumbers',
      defaultValue: 1,
    },
    {
      universalIdentifier: 'b20ccebd-2ce8-4664-abcd-82e27cbb09ef',
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Is active',
      icon: 'IconCheck',
      defaultValue: true,
    },
    {
      universalIdentifier: '04fc5e01-4b4e-4a58-826b-347b7ac958d8',
      type: FieldType.DATE_TIME,
      name: 'activatedAt',
      label: 'Activated at',
      icon: 'IconCalendarCheck',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'ef467df5-222a-43ae-ab3c-2cafad3c2544',
      type: FieldType.DATE_TIME,
      name: 'lastSyncedAt',
      label: 'Last synced at',
      icon: 'IconRefresh',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
