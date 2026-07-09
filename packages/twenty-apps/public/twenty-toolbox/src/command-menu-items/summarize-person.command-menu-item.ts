import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  SUMMARIZE_PERSON_COMMAND_UNIVERSAL_IDENTIFIER,
  SUMMARIZE_PERSON_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: SUMMARIZE_PERSON_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Summarize this Person',
  shortLabel: 'Summarize',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier:
    SUMMARIZE_PERSON_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
