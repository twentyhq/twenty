import {
  LAST_INTERACTION_FOR_OPPORTUNITIES_FIELD_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier:
    LAST_INTERACTION_FOR_OPPORTUNITIES_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  name: 'lastInteraction',
  type: FieldType.DATE_TIME,
  label: 'Last interaction',
  description:
    'When the most recent contact (email or meeting) with someone related to this opportunity occurred, in either direction.',
  icon: 'IconClock',
  isNullable: true,
});
