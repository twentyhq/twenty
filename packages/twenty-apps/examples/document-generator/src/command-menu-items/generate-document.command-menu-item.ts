import {
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  GENERATE_DOCUMENT_COMMAND_UNIVERSAL_IDENTIFIER,
  GENERATE_DOCUMENT_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Shows up in the command menu when a Person record is selected, opening the
// "Generate document" form in the side panel.
export default defineCommandMenuItem({
  universalIdentifier: GENERATE_DOCUMENT_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Generate document',
  shortLabel: 'Generate',
  isPinned: false,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier:
    GENERATE_DOCUMENT_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
