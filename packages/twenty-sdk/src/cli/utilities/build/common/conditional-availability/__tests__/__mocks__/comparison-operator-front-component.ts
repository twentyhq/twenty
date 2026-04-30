import { defineFrontComponent } from '@/sdk/define';
import { numberOfSelectedRecords } from '@/sdk/front-component';

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
