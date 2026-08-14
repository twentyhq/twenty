import { FieldType, defineObject } from 'twenty-sdk/define';

export const MEDIA_NOTE_UNIVERSAL_IDENTIFIER =
  '68d3bcc0-1a6c-4e7d-9fc3-c7bc57b8241d';

export const TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  'c1d4e7a2-3b56-4c89-9e12-4f6a8b0d3e75';

export const RECORDING_FIELD_UNIVERSAL_IDENTIFIER =
  'd2e5f8b3-4c67-4d9a-8f23-5a7b9c1e4f86';

export default defineObject({
  universalIdentifier: MEDIA_NOTE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'mediaNote',
  namePlural: 'mediaNotes',
  labelSingular: 'Media note',
  labelPlural: 'Media notes',
  description: 'A note captured with the microphone or camera',
  icon: 'IconMicrophone',
  labelIdentifierFieldMetadataUniversalIdentifier:
    TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      label: 'Title',
      description: "The media note's title",
      icon: 'IconAbc',
      name: 'title',
    },
    {
      universalIdentifier: RECORDING_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.FILES,
      label: 'Recording',
      description: 'The captured audio or video note',
      icon: 'IconMicrophone',
      name: 'recording',
      universalSettings: { maxNumberOfValues: 10 },
    },
  ],
});
