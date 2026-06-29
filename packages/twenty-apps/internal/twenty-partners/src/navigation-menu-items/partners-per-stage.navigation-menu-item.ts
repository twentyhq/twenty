import { NavigationMenuItemType, defineNavigationMenuItem } from 'twenty-sdk/define';

import { PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/views/partners-per-stage.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'fa1d850b-358c-45a4-a0af-a2fb4c06e129',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconTable',
  position: 1,
  folderUniversalIdentifier: '857be3b5-82c6-45f7-b546-e20a8a97be8d',
  viewUniversalIdentifier: PARTNERS_PER_STAGE_VIEW_UNIVERSAL_IDENTIFIER,
});
