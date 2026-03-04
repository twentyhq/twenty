import { defineFrontComponent, isShowPage, selectedRecord } from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'string-comparison',
  component: MyComponent,
  command: {
    universalIdentifier: 'string-comparison-cmd',
    label: 'String Comparison',
    conditionalAvailabilityExpression:
      isShowPage && selectedRecord.company.name === 'apple',
  },
});
