import {
  defineCommandMenuItem,
  isInSidePanel,
  objectPermissions,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'permissions-check-cmd',
  label: 'Permissions Check',
  frontComponentUniversalIdentifier: 'permissions-check',
  conditionalAvailabilityExpression:
    objectPermissions.canUpdateObjectRecords && !isInSidePanel,
});
