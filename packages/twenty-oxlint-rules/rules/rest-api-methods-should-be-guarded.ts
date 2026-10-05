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
    'REST API endpoints should declare the principals they accept with AuthPrincipalGuard({ ... }), authenticate with a file token guard (FilePathGuard, FileByIdGuard, ServerFileByIdGuard, FileUploadTokenGuard) or be explicitly marked as public (PublicEndpointGuard), and have permission guards (SettingsPermissionGuard or CustomPermissionGuard) to maintain our security model.',
  message:
    'All REST API controller endpoints must have an authentication guard (@UseGuards(AuthPrincipalGuard({ ... })), a file token guard, or PublicEndpointGuard) and permission guards (@UseGuards(..., SettingsPermissionGuard(...)), CustomPermissionGuard, or NoPermissionGuard).',
});
