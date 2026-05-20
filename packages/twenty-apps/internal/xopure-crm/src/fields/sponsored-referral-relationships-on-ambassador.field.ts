import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID } from '../objects/xopure-referral-relationship.object';

export const SPONSORED_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID =
  '9bb06d42-2b0c-4200-b3ef-942fe3d723f1';
export const SPONSOR_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID =
  '25c6e0f4-7410-44f2-a998-48f57c4c5ff0';

export default defineField({
  universalIdentifier: SPONSORED_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'sponsoredReferralRelationships',
  label: 'Sponsored referral relationships',
  relationTargetObjectMetadataUniversalIdentifier:
    XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    SPONSOR_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconTopologyStarRing3',
});
