import { defineView, ViewType } from 'twenty-sdk/define';

import {
  XOPURE_REFERRAL_RELATIONSHIP_ACTIVE_FIELD_ID,
  XOPURE_REFERRAL_RELATIONSHIP_DEPTH_FIELD_ID,
  XOPURE_REFERRAL_RELATIONSHIP_KEY_FIELD_ID,
  XOPURE_REFERRAL_RELATIONSHIP_LAST_SYNCED_AT_FIELD_ID,
  XOPURE_REFERRAL_RELATIONSHIP_NAME_FIELD_ID,
  XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  XOPURE_REFERRAL_RELATIONSHIP_SPONSORED_EXTERNAL_ID_FIELD_ID,
  XOPURE_REFERRAL_RELATIONSHIP_SPONSOR_EXTERNAL_ID_FIELD_ID,
} from '../objects/xopure-referral-relationship.object';

export default defineView({
  universalIdentifier: '9871f623-05ff-4b0a-bdac-cb9550d8118d',
  name: 'Ambassador Downline',
  objectUniversalIdentifier: XOPURE_REFERRAL_RELATIONSHIP_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconHierarchy2',
  position: 0,
  fields: [
    {
      universalIdentifier: '05593e23-5390-4f90-b07c-5f99d6f0f9d9',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_NAME_FIELD_ID,
      position: 0,
      isVisible: true,
      size: 260,
    },
    {
      universalIdentifier: 'cae5dd6f-1f07-44fe-aa04-49733e9c887d',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_SPONSOR_EXTERNAL_ID_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'd729b615-c6fe-4f05-8f23-13f34ab1eeb6',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_SPONSORED_EXTERNAL_ID_FIELD_ID,
      position: 2,
      isVisible: true,
      size: 200,
    },
    {
      universalIdentifier: 'cb137ff7-69e2-4d5a-82db-bf5f27b0aa95',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_DEPTH_FIELD_ID,
      position: 3,
      isVisible: true,
      size: 100,
    },
    {
      universalIdentifier: 'b6cd1a35-66df-488c-9fc0-d506d3e37e48',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_ACTIVE_FIELD_ID,
      position: 4,
      isVisible: true,
      size: 120,
    },
    {
      universalIdentifier: '95a17814-64b8-4a0f-b6bc-e7a8e4d9ea7f',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_KEY_FIELD_ID,
      position: 5,
      isVisible: false,
      size: 220,
    },
    {
      universalIdentifier: '9c092b36-6e7c-4bb6-973f-8129e563981d',
      fieldMetadataUniversalIdentifier:
        XOPURE_REFERRAL_RELATIONSHIP_LAST_SYNCED_AT_FIELD_ID,
      position: 6,
      isVisible: true,
      size: 180,
    },
  ],
});
