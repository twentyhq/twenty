import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';
import { XOPURE_AMBASSADOR_OBJECT_ID } from '../objects/xopure-ambassador.object';
import { AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID } from './ambassador-workspace-member.field';

export const WORKSPACE_MEMBER_AMBASSADOR_PROFILE_FIELD_ID =
  '4b617150-c1d8-5105-a818-0ce41dffe0e9';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBER_AMBASSADOR_PROFILE_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  type: FieldType.RELATION,
  name: 'ambassadorProfile',
  label: 'Ambassador Profile',
  relationTargetObjectMetadataUniversalIdentifier: XOPURE_AMBASSADOR_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: AMBASSADOR_WORKSPACE_MEMBER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
