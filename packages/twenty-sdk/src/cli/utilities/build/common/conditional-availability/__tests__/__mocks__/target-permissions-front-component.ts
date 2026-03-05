import {
  defineFrontComponent,
  isShowPage,
  targetObjectWritePermissions,
} from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'target-permissions',
  component: MyComponent,
  command: {
    universalIdentifier: 'target-permissions-cmd',
    label: 'Target Permissions',
    conditionalAvailabilityExpression:
      isShowPage && targetObjectWritePermissions.person,
  },
});
