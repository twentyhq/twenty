import {
  NavigationMenuItemType,
  defineNavigationMenuItem,
} from 'twenty-sdk/define';

import { PIPELINE_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/pipeline.view';

export default defineNavigationMenuItem({
  universalIdentifier: 'ae1632fc-c53c-4a27-8e07-ad1f3a2d08b9',
  type: NavigationMenuItemType.VIEW,
  icon: 'IconLayoutKanban',
  position: 3,
  folderUniversalIdentifier: '0b2e499a-ae74-45e0-af08-243e19fc56aa',
  viewUniversalIdentifier: PIPELINE_VIEW_UNIVERSAL_IDENTIFIER,
});
