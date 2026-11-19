import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'ca7e661a-508f-4365-84f9-5aee493613df',
  name: 'granolaPersonalNoteUpdatedAt',
  label: 'Granola personal note updated at',
  description:
    'Source revision for recordings synced by a personal Granola connection.',
  type: FieldType.DATE_TIME,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  icon: 'IconClock',
  isNullable: true,
  isUIEditable: false,
});
