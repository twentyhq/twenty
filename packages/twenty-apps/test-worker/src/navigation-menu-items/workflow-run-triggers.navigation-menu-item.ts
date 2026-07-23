import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER } from 'src/objects/workflow-run-trigger.object';

export default defineNavigationMenuItem({
  universalIdentifier: '3611364d-4d9f-45af-9c2f-ff26100c73da',
  position: 1,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: WORKFLOW_RUN_TRIGGER_UNIVERSAL_IDENTIFIER,
});
