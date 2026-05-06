import { defineCommandMenuItem } from '@/sdk/define';
import { isInSidePanel, objectPermissions } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'permissions-check-cmd',
  label: 'Permissions Check',
  frontComponentUniversalIdentifier: 'permissions-check',
  conditionalAvailabilityExpression:
    objectPermissions.canUpdateObjectRecords && !isInSidePanel,
});
