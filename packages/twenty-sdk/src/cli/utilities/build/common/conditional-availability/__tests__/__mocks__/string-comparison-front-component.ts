import {
  defineFrontComponent,
  everyEquals,
  pageType,
  selectedRecords,
} from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'string-comparison',
  component: MyComponent,
  command: {
    universalIdentifier: 'string-comparison-cmd',
    label: 'String Comparison',
    conditionalAvailabilityExpression:
      pageType === 'RECORD_PAGE' &&
      everyEquals(selectedRecords, 'company.name', 'apple'),
  },
});
