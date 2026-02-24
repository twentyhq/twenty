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
  ],
});
