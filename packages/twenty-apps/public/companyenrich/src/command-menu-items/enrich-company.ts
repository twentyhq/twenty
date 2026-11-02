import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: '2ecad3ae-6c0a-4b35-a442-97ba5898db95',
  label: 'Enrich company with CompanyEnrich',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  conditionalAvailabilityExpression: !isSelectAll,
  frontComponentUniversalIdentifier: '9cc7071d-128d-4346-ac83-45437f6c52a6',
});
