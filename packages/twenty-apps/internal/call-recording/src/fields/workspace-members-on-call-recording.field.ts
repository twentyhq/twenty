import { CALL_RECORDING_ON_WORKSPACE_MEMBER_ID } from 'src/fields/call-recording-on-workspace-member.field';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineField, FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk';

export const WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID =
  '5550e26a-4354-434b-b32e-3f7b04585113';

export default defineField({
  universalIdentifier: WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID,
  objectUniversalIdentifier: CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'workspaceMember',
  label: 'Workspace Member',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    CALL_RECORDING_ON_WORKSPACE_MEMBER_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'workspaceMemberId',
  },
  icon: 'IconUser',
});
