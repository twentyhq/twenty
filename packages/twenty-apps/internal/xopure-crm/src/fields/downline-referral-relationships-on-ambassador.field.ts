import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID } from '../objects/xopure-referral-relationship.object';

export const DOWNLINE_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID =
  '83c09d38-f747-4b6a-8646-3cd2d4735b68';
export const SPONSORED_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID =
  'ec9ecf0d-4d5d-4b8f-b09d-1ad9b8d03eea';

export default defineField({
  universalIdentifier: DOWNLINE_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID,
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'downlineReferralRelationships',
  label: 'Downline referral relationships',
  relationTargetObjectMetadataUniversalIdentifier:
    XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    SPONSORED_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  icon: 'IconHierarchy2',
});
