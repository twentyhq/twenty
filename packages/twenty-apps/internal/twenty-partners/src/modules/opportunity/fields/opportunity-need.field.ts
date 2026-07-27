import {
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

export const OPPORTUNITY_NEED_FIELD_ID =
  'fce63509-40c6-43e4-9def-d532c29cc0b8';

export default defineField({
  universalIdentifier: OPPORTUNITY_NEED_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'need',
  label: 'Need',
  icon: 'IconTargetArrow',
  isNullable: true,
});
