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
    { universalIdentifier: '5e8ef718-d045-4138-bc0b-0ec3c873caf3', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_NAME_FIELD_ID, position: 0, isVisible: true, size: 220 },
    { universalIdentifier: '80f56d75-a788-45d9-a41e-f83a965032be', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_LEVEL_FIELD_ID, position: 1, isVisible: true, size: 160 },
    { universalIdentifier: '68eec3c7-9250-4d7f-9827-df442bb7024d', fieldMetadataUniversalIdentifier: XOPURE_AMBASSADOR_STATUS_FIELD_ID, position: 2, isVisible: true, size: 160 },
    { universalIdentifier: '0f68d9e0-f123-5245-ab56-7c8d9e0f1a2b', fieldMetadataUniversalIdentifier: AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID, position: 3, isVisible: true, size: 200 },
    { universalIdentifier: '1a79e0f1-a234-5356-bc67-8d9e0f1a2b3c', fieldMetadataUniversalIdentifier: AMBASSADOR_MANAGER_WORKSPACE_MEMBER_FIELD_ID, position: 4, isVisible: true, size: 200 },
  ],
});
