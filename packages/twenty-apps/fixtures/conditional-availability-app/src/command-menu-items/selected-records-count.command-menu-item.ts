import {
  defineCommandMenuItem,
  numberOfSelectedRecords,
} from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000012',
  label: 'Selected records count',
  frontComponentUniversalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000022',
  isPinned: true,
  conditionalAvailabilityExpression: numberOfSelectedRecords > 0,
  conditionalPinnedExpression: 'numberOfSelectedRecords == 1',
});
