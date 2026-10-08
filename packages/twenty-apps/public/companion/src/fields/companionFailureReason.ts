import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '9c62c98a-143e-4dcf-a1d7-034fd2c5ccf9',
  name: 'companionFailureReason',
  label: 'Desktop recording failure reason',
  type: FieldType.TEXT,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.callRecording.universalIdentifier,
  description: 'Failure details for Companion capture or artifact processing.',
  icon: 'IconAlertCircle',
  isNullable: true,
  isUIEditable: false,
});
