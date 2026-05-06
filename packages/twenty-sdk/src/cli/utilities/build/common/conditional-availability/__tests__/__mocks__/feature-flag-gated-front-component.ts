import { defineCommandMenuItem } from '@/sdk/define';
import { featureFlags, objectPermissions } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'feature-flag-gated-cmd',
  label: 'Feature Flag Gated',
  frontComponentUniversalIdentifier: 'feature-flag-gated',
  conditionalAvailabilityExpression:
    featureFlags.IS_JUNCTION_RELATIONS_ENABLED &&
    objectPermissions.canReadObjectRecords,
});
