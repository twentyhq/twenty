import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { OPPORTUNITY_LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: OPPORTUNITY_LAST_CONTACT_AT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  name: 'lastContactAt',
  type: FieldType.DATE_TIME,
  label: 'Last contact',
  description:
    'When the most recent contact (email or meeting) with a person related to this opportunity occurred, in either direction.',
  icon: 'IconClock',
  isNullable: true,
  isUIEditable: false,
});
