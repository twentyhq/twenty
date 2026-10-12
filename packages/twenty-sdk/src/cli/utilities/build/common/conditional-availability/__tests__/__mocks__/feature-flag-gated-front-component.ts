import {
  defineCommandMenuItem,
  featureFlags,
  objectPermissions,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'feature-flag-gated-cmd',
  label: 'Feature Flag Gated',
  frontComponentUniversalIdentifier: 'feature-flag-gated',
  conditionalAvailabilityExpression:
    featureFlags.IS_EXAMPLE_FEATURE_ENABLED &&
    objectPermissions.canReadObjectRecords,
});
