import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineCommandMenuItem,
} from 'twenty-sdk/define';

import {
  APPLY_TO_BRIEF_COMMAND_MENU_ITEM_ID,
  APPLY_TO_BRIEF_FRONT_COMPONENT_ID,
} from 'src/modules/application/apply/constants/apply-to-brief.constants';

export default defineCommandMenuItem({
  universalIdentifier: APPLY_TO_BRIEF_COMMAND_MENU_ITEM_ID,
  label: 'Apply to this brief',
  shortLabel: 'Apply to this opportunity',
  icon: 'IconSend',
  isPinned: true,
  availabilityType: 'RECORD_SELECTION',
  availabilityObjectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  frontComponentUniversalIdentifier: APPLY_TO_BRIEF_FRONT_COMPONENT_ID,
});
