import { defineFrontComponent } from '@/sdk/define';
import { pageType, targetObjectWritePermissions } from '@/sdk/front-component';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'target-permissions',
  component: MyComponent,
  command: {
    universalIdentifier: 'target-permissions-cmd',
    label: 'Target Permissions',
    conditionalAvailabilityExpression:
      pageType === 'RECORD_PAGE' && targetObjectWritePermissions.person,
  },
});
