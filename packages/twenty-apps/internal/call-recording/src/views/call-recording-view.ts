import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER, CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER, ENDED_AT_FIELD_UNIVERSAL_IDENTIFIER, NAME_FIELD_UNIVERSAL_IDENTIFIER, RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER, TRANSCRIPT_FIELD_UNIVERSAL_IDENTIFIER, TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineView } from 'twenty-sdk';

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
      universalIdentifier: 'a7bce6c7-39ce-406a-bc6f-00b495951b4a',
      fieldMetadataUniversalIdentifier: RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 3,
    },
    {
      universalIdentifier: 'f3e2d1c0-a9b8-47c6-85d4-3e2f1a0b9c8d',
      fieldMetadataUniversalIdentifier: TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 4,
    },
    {
      universalIdentifier: 'e4c3b2a1-0d9e-48f7-a6b5-1c2d3e4f5a6b',
      fieldMetadataUniversalIdentifier: TRANSCRIPT_FIELD_UNIVERSAL_IDENTIFIER,
      isVisible: true,
      size: 12,
      position: 5,
    },
  ],
});
