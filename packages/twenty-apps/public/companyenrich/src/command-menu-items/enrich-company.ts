import { IDENTIFIERS } from 'src/constants/universal-identifiers';
import {
  defineCommandMenuItem,
  isSelectAll,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: IDENTIFIERS.enrichCompanyCommand,
  label: 'Enrich company with CompanyEnrich',
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  conditionalAvailabilityExpression: !isSelectAll,
  frontComponentUniversalIdentifier: IDENTIFIERS.enrichCompanyPanel,
});
