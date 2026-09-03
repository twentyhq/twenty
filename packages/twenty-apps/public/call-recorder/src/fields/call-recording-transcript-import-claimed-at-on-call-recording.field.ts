import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { CALL_RECORDING_TRANSCRIPT_IMPORT_CLAIMED_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier:
    CALL_RECORDING_TRANSCRIPT_IMPORT_CLAIMED_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'transcriptImportClaimedAt',
  label: 'Transcript Import Claimed At',
  description:
    'Lease held by the worker importing this recording’s transcript; kept separate from the media lease so a transcript callback is never bounced by a media upload in flight.',
  icon: 'IconLock',
  isNullable: true,
  isUIEditable: false,
});
