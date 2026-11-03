import { defineCommandMenuItem, isSelectAll } from 'twenty-sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000013',
  label: 'Not select all',
  frontComponentUniversalIdentifier: 'c0a1b2c3-0000-4000-8000-000000000023',
  conditionalAvailabilityExpression: !isSelectAll,
});
