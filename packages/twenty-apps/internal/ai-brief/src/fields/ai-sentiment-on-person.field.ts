import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { AI_SENTIMENT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: AI_SENTIMENT_ON_PERSON_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'aiSentiment',
  label: 'AI Sentiment',
  description:
    'Overall sentiment of recent interactions, set by the AI Brief app.',
  icon: 'IconHeart',
  isNullable: true,
  options: [
    {
      id: '9a111111-1111-4111-9111-000000000001',
      value: 'POSITIVE',
      label: 'Positive',
      position: 0,
      color: 'green',
    },
    {
      id: '9a111111-1111-4111-9111-000000000002',
      value: 'NEUTRAL',
      label: 'Neutral',
      position: 1,
      color: 'gray',
    },
    {
      id: '9a111111-1111-4111-9111-000000000003',
      value: 'NEGATIVE',
      label: 'Negative',
      position: 2,
      color: 'red',
    },
    {
      id: '9a111111-1111-4111-9111-000000000004',
      value: 'MIXED',
      label: 'Mixed',
      position: 3,
      color: 'orange',
    },
  ],
});
