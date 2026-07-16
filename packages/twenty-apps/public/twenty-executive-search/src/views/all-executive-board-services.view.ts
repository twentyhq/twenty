import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER } from '../objects/executive-board-service.object';

export const EXECUTIVE_BOARD_SERVICE_VIEW_ID =
  'd169c972-f6cb-40fd-9531-a69e7f9ef251';

export default defineView({
  universalIdentifier: EXECUTIVE_BOARD_SERVICE_VIEW_ID,
  name: 'All Board Services',
  objectUniversalIdentifier: EXECUTIVE_BOARD_SERVICE_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconBuildingCommunity',
  position: 0,
  fields: [],
});
