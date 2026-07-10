import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SUMMARIZE_OPPORTUNITY_COMMAND_UNIVERSAL_IDENTIFIER,
  SUMMARIZE_OPPORTUNITY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SUMMARIZE_OPPORTUNITY_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Summarize this Opportunity',
  shortLabel: 'Summarize',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  frontComponentUniversalIdentifier:
    SUMMARIZE_OPPORTUNITY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
