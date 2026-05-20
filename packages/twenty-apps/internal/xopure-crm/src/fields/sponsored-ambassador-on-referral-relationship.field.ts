import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID } from '../objects/xopure-referral-relationship.object';

import {
  DOWNLINE_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID,
  SPONSORED_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID,
} from './downline-referral-relationships-on-ambassador.field';

export default defineField({
  universalIdentifier: SPONSORED_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID,
  objectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'sponsored',
  label: 'Sponsored ambassador',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    DOWNLINE_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'sponsoredId',
  },
  icon: 'IconUser',
});
