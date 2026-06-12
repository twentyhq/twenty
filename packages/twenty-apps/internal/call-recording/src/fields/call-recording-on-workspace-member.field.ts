import { WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID } from 'src/fields/workspace-members-on-call-recording.field';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export const CALL_RECORDING_ON_WORKSPACE_MEMBER_ID =
  'ae57f5bc-b9f1-4867-887a-834c14737bae';

export default defineField({
  universalIdentifier: CALL_RECORDING_ON_WORKSPACE_MEMBER_ID,
  objectUniversalIdentifier: '20202020-3319-4234-a34c-82d5c0e881a6',
  type: FieldType.RELATION,
  name: 'callRecordings',
  label: 'Call Recordings',
  relationTargetObjectMetadataUniversalIdentifier:
    CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
