import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';
import { LAST_INTERACTION_FOR_COMPANIES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: LAST_INTERACTION_FOR_COMPANIES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  name: 'lastInteraction',
  type: FieldType.DATE_TIME,
  label: 'Last interaction',
  description:
    'When the most recent contact (email or meeting) with someone from this company occurred, in either direction.',
  icon: 'IconClock',
  isNullable: true,
});
