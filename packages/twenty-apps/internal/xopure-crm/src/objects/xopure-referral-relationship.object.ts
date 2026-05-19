import { defineObject, FieldType } from 'twenty-sdk/define';

export const XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID =
  '6ba7b820-9dad-11d1-80b4-00c04fd430c8';
export const XOPURE_REFERRAL_RELATIONSHIP_NAME_FIELD_ID =
  '6ba7b821-9dad-11d1-80b4-00c04fd430c8';

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
      universalIdentifier: 'a1c2d3e4-5678-4abc-def0-1234567890a1',
      type: FieldType.TEXT,
      name: 'sponsorAmbassadorExternalId',
      label: 'Sponsor ambassador ID',
      icon: 'IconUserStar',
    },
    {
      universalIdentifier: 'b2d3e4f5-6789-4bcd-efa0-2345678901b2',
      type: FieldType.TEXT,
      name: 'sponsoredAmbassadorExternalId',
      label: 'Sponsored ambassador ID',
      icon: 'IconUser',
    },
    {
      universalIdentifier: 'c3e4f5a6-7890-4cde-fab0-3456789012c3',
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
      universalIdentifier: 'f6b7c8d9-0123-4fab-cde0-6789012345f6',
      type: FieldType.BOOLEAN,
      name: 'isActive',
      label: 'Is active',
      icon: 'IconCheck',
      defaultValue: true,
    },
    {
      universalIdentifier: 'a7c8d9e0-1234-4abc-def0-7890123456a7',
      type: FieldType.DATE_TIME,
      name: 'activatedAt',
      label: 'Activated at',
      icon: 'IconCalendarCheck',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: 'b8d9e0f1-2345-4bcd-efa0-8901234567b8',
      type: FieldType.DATE_TIME,
      name: 'lastSyncedAt',
      label: 'Last synced at',
      icon: 'IconRefresh',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
