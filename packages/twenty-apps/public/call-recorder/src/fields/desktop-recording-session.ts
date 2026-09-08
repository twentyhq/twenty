import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '1ba89910-52e3-4630-9bf5-3587141949e7',
  name: 'desktopRecordingSession',
  label: 'Desktop recording session',
  type: FieldType.RAW_JSON,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  description:
    'Desktop capture session, owning user and Recall upload reference.',
  icon: 'IconDeviceDesktop',
  isNullable: true,
  isUIEditable: false,
});
