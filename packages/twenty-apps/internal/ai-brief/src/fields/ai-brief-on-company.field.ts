import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { AI_BRIEF_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: AI_BRIEF_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RICH_TEXT,
  name: 'aiBrief',
  label: 'AI Brief',
  description:
    'Living account brief synthesized from recent timeline activity by the AI Brief app.',
  icon: 'IconSparkles',
  isNullable: true,
});
