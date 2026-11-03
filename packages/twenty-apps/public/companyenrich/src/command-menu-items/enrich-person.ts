import { IDENTIFIERS } from 'src/constants/universal-identifiers';
import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: IDENTIFIERS.enrichPersonCommand,
  label: 'Enrich person with CompanyEnrich',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  conditionalAvailabilityExpression: !isSelectAll,
  frontComponentUniversalIdentifier: IDENTIFIERS.enrichPersonPanel,
});
