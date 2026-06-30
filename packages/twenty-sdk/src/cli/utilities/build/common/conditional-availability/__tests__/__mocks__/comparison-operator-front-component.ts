import {
  defineCommandMenuItem,
  numberOfSelectedRecords,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'comparison-operator-cmd',
  label: 'Comparison Operator',
  frontComponentUniversalIdentifier: 'comparison-operator',
  conditionalAvailabilityExpression: numberOfSelectedRecords > 0,
});
