import { defineFrontComponent } from '@/sdk/define';
import { someDefined, selectedRecords } from '@/sdk/front-component';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'custom-function',
  component: MyComponent,
  command: {
    universalIdentifier: 'custom-function-cmd',
    label: 'Custom Function',
    conditionalAvailabilityExpression: someDefined(
      selectedRecords,
      'deletedAt',
    ),
  },
});
