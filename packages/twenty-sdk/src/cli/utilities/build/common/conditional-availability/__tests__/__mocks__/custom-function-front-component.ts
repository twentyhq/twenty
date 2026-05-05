import { defineCommandMenuItem } from '@/sdk/define';
import { someDefined, selectedRecords } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'custom-function-cmd',
  label: 'Custom Function',
  frontComponentUniversalIdentifier: 'custom-function',
  conditionalAvailabilityExpression: someDefined(selectedRecords, 'deletedAt'),
});
