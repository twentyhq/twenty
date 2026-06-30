import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { LAST_ENGAGEMENT_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LAST_ENGAGEMENT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  name: 'lastEngagementAt',
  type: FieldType.DATE_TIME,
  label: 'Last engagement',
  description:
    'When this person last reached out or responded (an inbound email, or a meeting they organized).',
  icon: 'IconMessageDots',
  isNullable: true,
});
