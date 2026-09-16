import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { AI_BRIEF_UPDATED_AT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: AI_BRIEF_UPDATED_AT_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'aiBriefUpdatedAt',
  label: 'AI Brief Updated At',
  description: 'When the AI Brief app last regenerated the brief for this record.',
  icon: 'IconRefresh',
  isNullable: true,
});
