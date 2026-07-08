import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  MIGRATION_WIZARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  OPEN_MIGRATION_WIZARD_COMMAND_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: OPEN_MIGRATION_WIZARD_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Migrate from Salesforce',
  shortLabel: 'Salesforce migration',
  isPinned: true,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    MIGRATION_WIZARD_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
