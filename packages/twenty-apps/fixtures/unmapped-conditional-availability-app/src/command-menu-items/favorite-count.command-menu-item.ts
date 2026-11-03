import { defineCommandMenuItem, favoriteRecordIds } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000111',
  label: 'Favorite count',
  frontComponentUniversalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000121',
  conditionalAvailabilityExpression: favoriteRecordIds.length > 0,
});
