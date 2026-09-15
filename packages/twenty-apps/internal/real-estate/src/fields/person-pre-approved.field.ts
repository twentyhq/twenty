import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export const PRE_APPROVED_FIELD_UNIVERSAL_IDENTIFIER =
  '21e0c04d-845e-4639-b9f6-2d35177ae05a';

export default defineField({
  universalIdentifier: PRE_APPROVED_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'preApproved',
  label: 'Pre-approved',
  description: 'Whether the buyer has financing pre-approval',
  icon: 'IconCheck',
  defaultValue: false,
});
