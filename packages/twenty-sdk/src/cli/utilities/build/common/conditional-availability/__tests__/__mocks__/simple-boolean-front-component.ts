import { defineFrontComponent } from '@/sdk/define';
import { pageType } from '@/sdk/front-component';

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
