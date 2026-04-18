import { defineFrontComponent } from '@/sdk/define';
import { featureFlags, objectPermissions } from '@/sdk/front-component';

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
