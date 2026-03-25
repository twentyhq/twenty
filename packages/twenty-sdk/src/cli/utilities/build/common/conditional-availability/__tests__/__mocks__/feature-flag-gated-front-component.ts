import { defineFrontComponent, featureFlags, objectPermissions } from '@/sdk';

const MyComponent = () => null;

export default defineFrontComponent({
  universalIdentifier: 'feature-flag-gated',
  component: MyComponent,
  command: {
    universalIdentifier: 'feature-flag-gated-cmd',
    label: 'Feature Flag Gated',
    conditionalAvailabilityExpression:
      featureFlags.IS_AI_ENABLED && objectPermissions.canReadObjectRecords,
  },
});
