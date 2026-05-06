import { defineCommandMenuItem } from '@/sdk/define';
import { pageType, targetObjectWritePermissions } from '@/sdk/front-component';

export default defineCommandMenuItem({
  universalIdentifier: 'target-permissions-cmd',
  label: 'Target Permissions',
  frontComponentUniversalIdentifier: 'target-permissions',
  conditionalAvailabilityExpression:
    pageType === 'RECORD_PAGE' && targetObjectWritePermissions.person,
});
