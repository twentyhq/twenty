import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { COMPANY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: COMPANY_LAST_EMAIL_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  name: 'lastEmailAt',
  type: FieldType.DATE_TIME,
  label: 'Last email date',
  description:
    'When the most recent email with a person from this company was exchanged.',
  icon: 'IconClock',
  isNullable: true,
});
