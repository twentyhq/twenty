import { defineView, ViewType } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_NAME_FIELD_ID, XOPURE_AMBASSADOR_LEVEL_FIELD_ID, XOPURE_AMBASSADOR_STATUS_FIELD_ID, XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID } from '../fields/ambassador-manager-workspace-member.field';
import { AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID } from '../fields/ambassador-workspace-member.field';

export default defineView({
  universalIdentifier: 'a343ef2e-8e36-522e-ae02-8fb9586d2853',
  name: 'Ambassador Roster',
  objectUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  type: ViewType.TABLE,
  icon: 'IconUsers',
  position: 1,
  fields: [
    { universalIdentifier: 'dc35a6b7-c890-5f12-de23-4f5a6b7c8d9e', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: 'ed46b7c8-d901-5023-ef34-5a6b7c8d9e0f', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_LEVEL_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: 'fe57c8d9-e012-5134-fa45-6b7c8d9e0f1a', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_STATUS_FIELD_ID, position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '0f68d9e0-f123-5245-ab56-7c8d9e0f1a2b', fieldMetadataUniversalIdentifier: AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID, position: 3, isVisible: true, size: 200 },
    { universalIdentifier: '1a79e0f1-a234-5356-bc67-8d9e0f1a2b3c', fieldMetadataUniversalIdentifier: AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID, position: 4, isVisible: true, size: 200 },
  ],
});
