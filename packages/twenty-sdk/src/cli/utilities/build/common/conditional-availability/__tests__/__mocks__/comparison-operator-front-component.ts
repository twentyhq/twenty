import { defineCommandMenuItem } from '@/sdk/define';
import { numberOfSelectedRecords } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'comparison-operator-cmd',
  label: 'Comparison Operator',
  frontComponentUniversalIdentifier: 'comparison-operator',
  conditionalAvailabilityExpression: numberOfSelectedRecords > 0,
});
