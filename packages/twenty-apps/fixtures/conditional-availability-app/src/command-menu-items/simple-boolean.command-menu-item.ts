import { defineCommandMenuItem, isInSidePanel } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000011',
  label: 'Simple boolean',
  frontComponentUniversalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000021',
  conditionalAvailabilityExpression: isInSidePanel,
});
