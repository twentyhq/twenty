import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { OPPORTUNITY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  name: 'lastEmailAt',
  type: FieldType.DATE_TIME,
  label: 'Last email date',
  description:
    'When the most recent email with a person related to this opportunity was exchanged.',
  icon: 'IconClock',
  isNullable: true,
});
