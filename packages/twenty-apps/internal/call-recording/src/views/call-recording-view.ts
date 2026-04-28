import { WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID } from 'src/fields/workspace-members-on-call-recording.field';
import { PEOPLE_ON_CALL_RECORDING_ID } from 'src/fields/people-on-call-recording.field';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER, CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER, ENDED_AT_FIELD_UNIVERSAL_IDENTIFIER, NAME_FIELD_UNIVERSAL_IDENTIFIER, RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER, STATUS_FIELD_UNIVERSAL_IDENTIFIER, SUMMARY_FIELD_UNIVERSAL_IDENTIFIER, TRANSCRIPT_FIELD_UNIVERSAL_IDENTIFIER, TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineView } from 'twenty-sdk/define';

export const CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIER =
  '9c9c09bb-de9f-4248-89f2-e7d91f29c3ed';

export default defineView({
  universalIdentifier: CALL_RECORDING_VIEW_UNIVERSAL_IDENTIFIER,
  name: 'Call recordings',
  objectUniversalIdentifier: CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  icon: 'IconPhone',
  position: 0,
  fields: [
    {
      universalIdentifier: 'b5609679-8451-45ec-ad52-5a4e3720af45',
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 0,
    },
    {
      universalIdentifier: 'd791bea6-c49e-4d6f-8864-737ed00276f8',
      fieldMetadataUniversalIdentifier: CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 1,
    },
    {
      universalIdentifier: 'db96d9cf-cbd8-407b-b748-7b12913f018b',
      fieldMetadataUniversalIdentifier: ENDED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 2,
    },
    {
      universalIdentifier: '17c4e68a-5b62-4509-b8ed-19f82dfb8e2f',
      fieldMetadataUniversalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: 'a7bce6c7-39ce-406a-bc6f-00b495951b4a',
      fieldMetadataUniversalIdentifier: RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: 'f3e2d1c0-a9b8-47c6-85d4-3e2f1a0b9c8d',
      fieldMetadataUniversalIdentifier: TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
    {
      universalIdentifier: 'e4c3b2a1-0d9e-48f7-a6b5-1c2d3e4f5a6b',
      fieldMetadataUniversalIdentifier: TRANSCRIPT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 6,
    },
    {
      universalIdentifier: '56925631-0077-4b65-a25a-24afec4d8bff',
      fieldMetadataUniversalIdentifier: WORKSPACE_MEMBERS_ON_CALL_RECORDING_ID,
      isVisible: true,
      size: 12,
      position: 7,
    },
    {
      universalIdentifier: '1ba8538d-9c8e-47bf-b485-a8ba07b3d9a3',
      fieldMetadataUniversalIdentifier: PEOPLE_ON_CALL_RECORDING_ID,
      isVisible: true,
      size: 12,
      position: 8,
    },
    {
      universalIdentifier: '58124ded-56ff-40a0-8858-eae1b5ae75d7',
      fieldMetadataUniversalIdentifier: SUMMARY_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 6,
    },
  ],
});
