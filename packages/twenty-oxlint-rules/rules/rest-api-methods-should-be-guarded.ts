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
    'REST API endpoints should declare who can call them and which flags they need with AccessPolicyGuard, or authenticate with a file token guard (FilePathGuard, FileByIdGuard, FileUploadTokenGuard) or be explicitly marked as public (PublicEndpointGuard) with a permission guard such as NoPermissionGuard.',
  message:
    'All REST API controller endpoints must have an AccessPolicyGuard (@UseGuards(AccessPolicyGuard(SOME_ACCESS_POLICY)) or an inline policy) on the method or its class, or a file token guard or PublicEndpointGuard together with a permission guard such as NoPermissionGuard.',
});
