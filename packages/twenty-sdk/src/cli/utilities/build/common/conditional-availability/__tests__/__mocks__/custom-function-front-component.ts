import {
  defineCommandMenuItem,
  selectedRecords,
  someDefined,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'custom-function-cmd',
  label: 'Custom Function',
  frontComponentUniversalIdentifier: 'custom-function',
  conditionalAvailabilityExpression: someDefined(selectedRecords, 'deletedAt'),
});
