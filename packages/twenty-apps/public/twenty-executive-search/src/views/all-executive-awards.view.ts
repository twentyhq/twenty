import { defineView } from 'twenty-sdk/define';
import { ViewType } from 'twenty-sdk/define';
import { EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER } from '../objects/executive-award.object';

export const EXECUTIVE_AWARD_VIEW_ID =
  'bab3f617-4dc6-44c5-83ee-f493af772507';

export default defineView({
  universalIdentifier: EXECUTIVE_AWARD_VIEW_ID,
  name: 'All Awards',
  objectUniversalIdentifier: EXECUTIVE_AWARD_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconTrophy',
  position: 0,
  fields: [],
});
