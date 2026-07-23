import {
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

export const OPPORTUNITY_REQUIREMENTS_FIELD_ID =
  '68a8e0f1-6b68-4f99-9bad-9a78c21fc56d';

export default defineField({
  universalIdentifier: OPPORTUNITY_REQUIREMENTS_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'requirements',
  label: 'Requirements',
  icon: 'IconListCheck',
  isNullable: true,
});
