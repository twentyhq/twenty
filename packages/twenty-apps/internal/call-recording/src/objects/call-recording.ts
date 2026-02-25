import { defineObject, FieldType } from 'twenty-sdk';

export const CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER =
  'af251b70-85c6-49bd-bf4a-2631f34c8f1a';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '272dca6f-b3aa-49f5-b7ed-39780052f1fe';

export const CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'c581a044-f646-464b-aa4b-56b8ea9bf05a';

export const ENDED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '56185e64-6591-41c1-a3e0-af8de20a5471';

export const RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER =
  'e78d41fd-a493-4d06-b036-0dd7b7617dbe';

export const TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER =
  'b2a3c8e1-7f94-4d5b-a6e2-9c1d0f3e8b47';

export const TRANSCRIPT_FIELD_UNIVERSAL_IDENTIFIER =
  'a1d4e7c3-5b28-4f96-8e3a-0c7d9f2b6a15';

export const SUMMARY_FIELD_UNIVERSAL_IDENTIFIER =
  '55eb083f-0b68-4f5c-bcd7-c853ad77ba11';

export const STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '24c92ad0-4559-4bf9-a9fa-09168914a142';

export default defineObject({
  universalIdentifier: CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'callRecording',
  namePlural: 'callRecordings',
  labelSingular: 'Call recording',
  labelPlural: 'Call recordings',
  description: 'A recorded call',
  icon: 'IconPhone',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the call recording',
      icon: 'IconAbc',
    },
    {
      universalIdentifier: CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'createdAt',
      label: 'Created at',
      description: 'When the call recording was created',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: ENDED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.DATE_TIME,
      name: 'endedAt',
      label: 'Ended at',
      description: 'When the call ended',
      icon: 'IconCalendar',
    },
    {
      universalIdentifier: RECORDING_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'recordingFile',
      label: 'Recording file',
      description: 'The recording file of the call recording',
      icon: 'IconFile',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: TRANSCRIPT_FILE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      name: 'transcriptFile',
      label: 'Transcript file',
      description: 'The transcript file of the call recording',
      icon: 'IconFileText',
      universalSettings: { maxNumberOfValues: 1 },
    },
    {
      universalIdentifier: TRANSCRIPT_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT_V2,
      name: 'transcript',
      label: 'Transcript',
      description: 'Human-readable transcript of the call',
      icon: 'IconMessage',
    },
    {
      universalIdentifier: STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Status of the call recording',
      icon: 'IconStatusChange',
      defaultValue: "'ONGOING'",
      options: [
        {
          id: '8b275a4d-98ba-4718-912d-b1d97e713f5d',
          value: 'ONGOING',
          label: 'Ongoing',
          position: 0,
          color: 'blue',
        },
        {
          id: 'a515ac77-44f8-4744-9c50-0a29352a800d',
          value: 'ENDED',
          label: 'Ended',
          position: 1,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier: SUMMARY_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.RICH_TEXT_V2,
      name: 'summary',
      label: 'Summary',
      description: 'AI-generated summary of the call',
      icon: 'IconSparkles',
    },
  ],
});
