import { defineFrontComponent, pageType } from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'simple-boolean',
  component: MyComponent,
  command: {
    universalIdentifier: 'simple-boolean-cmd',
    label: 'Simple Boolean',
    conditionalAvailabilityExpression: pageType === 'RECORD_PAGE',
  },
});
