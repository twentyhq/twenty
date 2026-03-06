import { defineFrontComponent, isInSidePanel, objectPermissions } from '@/sdk';

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
