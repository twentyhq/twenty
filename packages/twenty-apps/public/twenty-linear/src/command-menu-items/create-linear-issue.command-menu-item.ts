import { defineCommandMenuItem } from 'twenty-sdk/define';

import {
  CREATE_ISSUE_COMMAND_UNIVERSAL_IDENTIFIER,
  CREATE_ISSUE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: CREATE_ISSUE_COMMAND_UNIVERSAL_IDENTIFIER,
  label: 'Create Linear issue',
  shortLabel: 'Linear issue',
  icon: 'IconPlaylistAdd',
  isPinned: false,
  availabilityType: 'GLOBAL',
  frontComponentUniversalIdentifier:
    CREATE_ISSUE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
