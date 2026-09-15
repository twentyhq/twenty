import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'd2629373-7c86-4996-b09c-145fa531bc55',
  name: 'companionSession',
  label: 'Desktop recording session',
  type: FieldType.RAW_JSON,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  description:
    'Companion session ownership and Recall desktop upload reference.',
  icon: 'IconDeviceDesktop',
  isNullable: true,
  isUIEditable: false,
});
