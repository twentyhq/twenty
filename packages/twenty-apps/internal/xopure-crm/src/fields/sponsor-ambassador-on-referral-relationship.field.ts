import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
} from 'twenty-sdk/define';

import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID } from '../objects/xopure-referral-relationship.object';

import {
  SPONSORED_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID,
  SPONSOR_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID,
} from './sponsored-referral-relationships-on-ambassador.field';

export default defineField({
  universalIdentifier: SPONSOR_AMBASSADOR_ON_REFERRAL_RELATIONSHIP_FIELD_ID,
  objectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'sponsor',
  label: 'Sponsor',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier:
    SPONSORED_REFERRAL_RELATIONSHIPS_ON_AMBASSADOR_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'sponsorId',
  },
  icon: 'IconUserStar',
});
