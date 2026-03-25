import { defineFrontComponent, numberOfSelectedRecords } from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'comparison-operator',
  component: MyComponent,
  command: {
    universalIdentifier: 'comparison-operator-cmd',
    label: 'Comparison Operator',
    conditionalAvailabilityExpression: numberOfSelectedRecords > 0,
  },
});
