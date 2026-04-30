import { defineFrontComponent } from '@/sdk/define';
import { isInSidePanel, objectPermissions } from '@/sdk/front-component';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'permissions-check',
  component: MyComponent,
  command: {
    universalIdentifier: 'permissions-check-cmd',
    label: 'Permissions Check',
    conditionalAvailabilityExpression:
      objectPermissions.canUpdateObjectRecords && !isInSidePanel,
  },
});
