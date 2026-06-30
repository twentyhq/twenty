import {
  defineCommandMenuItem,
  pageType,
  targetObjectWritePermissions,
} from '@/sdk/define';

export default defineCommandMenuItem({
  universalIdentifier: 'target-permissions-cmd',
  label: 'Target Permissions',
  frontComponentUniversalIdentifier: 'target-permissions',
  conditionalAvailabilityExpression:
    pageType === 'RECORD_PAGE' && targetObjectWritePermissions.person,
});
