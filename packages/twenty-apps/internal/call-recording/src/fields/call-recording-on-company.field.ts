import {
  COMPANIES_ON_CALL_RECORDING_ID,
} from 'src/fields/companies-on-call-recording.field';
import { CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/call-recording';
import { defineField, FieldType, RelationType } from 'twenty-sdk';

export const CALL_RECORDING_ON_COMPANY_ID =
  'ae57f5bc-b9f1-4867-887a-834c14737bae';

export default defineField({
  universalIdentifier: CALL_RECORDING_ON_COMPANY_ID,
  objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
  type: FieldType.RELATION,
  name: 'callRecording',
  label: 'Call Recording',
  relationTargetObjectMetadataUniversalIdentifier:
    CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    COMPANIES_ON_CALL_RECORDING_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'callRecordingId',
  },
});
