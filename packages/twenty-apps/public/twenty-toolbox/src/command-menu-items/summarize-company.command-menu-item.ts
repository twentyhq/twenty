import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SUMMARIZE_COMPANY_COMMAND_UNIVERSAL_IDENTIFIER,
  SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SUMMARIZE_COMPANY_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Summarize this Company',
  shortLabel: 'Summarize',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  frontComponentUniversalIdentifier:
    SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
