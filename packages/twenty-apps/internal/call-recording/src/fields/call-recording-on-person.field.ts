import {
  PEOPLE_ON_CALL_RECORDING_ID,
} from 'src/fields/people-on-call-recording.field';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const CALL_RECORDING_ON_PERSON_ID =
  'c62ae064-88aa-48a7-84b3-c9940e3a5db9';

export default defineField({
  universalIdentifier: CALL_RECORDING_ON_PERSON_ID,
  objectUniversalIdentifier: '20202020-e674-48e5-a542-72570eee7213',
  type: FieldType.RELATION,
  name: 'callRecordings',
  label: 'Call Recordings',
  relationTargetObjectMetadataUniversalIdentifier:
    CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PEOPLE_ON_CALL_RECORDING_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
