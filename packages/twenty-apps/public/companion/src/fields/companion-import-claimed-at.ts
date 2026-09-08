import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: 'f99e9220-9618-4347-8ea9-d335f8c1305e',
  name: 'companionImportClaimedAt',
  label: 'Desktop recording import claimed at',
  type: FieldType.DATE_TIME,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  description: 'Lease preventing concurrent Companion artifact imports.',
  icon: 'IconLock',
  isNullable: true,
  isUIEditable: false,
});
