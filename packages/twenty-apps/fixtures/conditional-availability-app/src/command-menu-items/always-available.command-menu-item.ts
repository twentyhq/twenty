import { defineCommandMenuItem } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000014',
  label: 'Always available',
  frontComponentUniversalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000024',
  conditionalAvailabilityExpression: true,
});
