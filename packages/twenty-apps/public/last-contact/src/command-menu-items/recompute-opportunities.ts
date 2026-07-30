import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  RECOMPUTE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  RECOMPUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';
import { RECOMPUTE_TARGETS } from 'src/types/recompute-target';

export default defineCommandMenuItem({
  universalIdentifier:
    RECOMPUTE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.opportunity,
  availabilityObjectUniversalIdentifier:
    RECOMPUTE_TARGETS.opportunity.objectUniversalIdentifier,
  frontComponentUniversalIdentifier:
    RECOMPUTE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.opportunity,
  label: 'Recompute last contact',
  shortLabel: 'Recompute',
  availabilityType: 'RECORD_SELECTION',
});
