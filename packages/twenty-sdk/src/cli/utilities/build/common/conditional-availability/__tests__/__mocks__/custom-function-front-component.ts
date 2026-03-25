import { defineFrontComponent, someDefined, selectedRecords } from '@/sdk';

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
