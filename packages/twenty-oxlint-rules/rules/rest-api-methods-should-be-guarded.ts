import { createGuardedEndpointRule } from '../utils/createGuardedEndpointRule';

export const RULE_NAME = 'rest-api-methods-should-be-guarded';

export const rule = createGuardedEndpointRule({
  triggerDecorators: [
    'Get',
    'Post',
    'Put',
    'Delete',
    'Patch',
    'Options',
    'Head',
    'All',
  ],
  messageId: 'restApiMethodsShouldBeGuarded',
  description:
    'REST API endpoints should have authentication guards (UserAuthGuard, WorkspaceAuthGuard, FilePathGuard, FileByIdGuard, FileUploadTokenGuard) or be explicitly marked as public (PublicEndpointGuard) and permission guards (SettingsPermissionGuard or CustomPermissionGuard) to maintain our security model.',
  message:
    'All REST API controller endpoints must have authentication guards (@UseGuards(...)) and permission guards (@UseGuards(..., SettingsPermissionGuard(...)), CustomPermissionGuard, or NoPermissionGuard).',
});
