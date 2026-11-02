import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'e910fb67-4496-4c8a-9567-3c9dcab9682b',
  label: 'Enrich person with CompanyEnrich',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  conditionalAvailabilityExpression: !isSelectAll,
  frontComponentUniversalIdentifier: 'c036dd61-6364-403b-b6f6-f82a7cb6b9d2',
});
