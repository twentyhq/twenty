import {
  SALES_NOTE_AUDIO_FILE_FIELD_UID,
  SALES_NOTE_BODY_FIELD_UID,
  SALES_NOTE_NAME_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_STATUS_DRAFT_OPTION_ID,
  SALES_NOTE_STATUS_FIELD_UID,
  SALES_NOTE_STATUS_FINAL_OPTION_ID,
  SALES_NOTE_SUMMARY_FIELD_UID,
  SALES_NOTE_VOICENOTES_ID_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineObject, FieldType } from 'twenty-sdk/define';

export default defineObject({
  universalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'salesNote',
  namePlural: 'salesNotes',
  labelSingular: 'Sales note',
  labelPlural: 'Sales notes',
  description:
    'Sales-rep call/meeting notes. AI summarises the body and can extract follow-up tasks.',
  icon: 'IconNotebook',
  labelIdentifierFieldMetadataUniversalIdentifier: SALES_NOTE_NAME_FIELD_UID,
  fields: [
    {
      universalIdentifier: SALES_NOTE_NAME_FIELD_UID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Title',
      description: 'Short title of the sales note',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: SALES_NOTE_BODY_FIELD_UID,
      type: FieldType.RICH_TEXT,
      name: 'body',
      label: 'Notes',
      description:
        'Sales-rep typed notes (or, later, Whisper transcript of a voice memo).',
      icon: 'IconNotes',
    },
    {
      universalIdentifier: SALES_NOTE_SUMMARY_FIELD_UID,
      type: FieldType.RICH_TEXT,
      name: 'summary',
      label: 'Summary',
      description:
        'AI-generated digest of the notes (overview, key points, action items).',
      icon: 'IconSparkles',
    },
    {
      universalIdentifier: SALES_NOTE_STATUS_FIELD_UID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Draft (still being written) or Final (ready to act on).',
      icon: 'IconStatusChange',
      defaultValue: "'DRAFT'",
      options: [
        {
          id: SALES_NOTE_STATUS_DRAFT_OPTION_ID,
          value: 'DRAFT',
          label: 'Draft',
          position: 0,
          color: 'gray',
        },
        {
          id: SALES_NOTE_STATUS_FINAL_OPTION_ID,
          value: 'FINAL',
          label: 'Final',
          position: 1,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier: SALES_NOTE_AUDIO_FILE_FIELD_UID,
      type: FieldType.FILES,
      name: 'audioFile',
      label: 'Audio note',
      description:
        'Optional voice memo. Reserved for issue #103 (Whisper transcription) — no UI in v1.',
      icon: 'IconMicrophone',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: SALES_NOTE_VOICENOTES_ID_FIELD_UID,
      type: FieldType.TEXT,
      name: 'voicenotesId',
      label: 'Voicenotes id',
      description:
        'External id from the Voicenotes webhook source (when the salesNote was ingested via that path). Used as an idempotency key for retries and to match update/summary events back to the right salesNote.',
      icon: 'IconMicrophone',
      isNullable: true,
      isUnique: true,
    },
    // NOTE: createdAt is provided automatically by Twenty as a system field;
    // do NOT redefine it here (doing so leaves the DB column NULL because the
    // SDK treats it as a user-managed value).
  ],
});
