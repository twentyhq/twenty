import { createGuardedEndpointRule } from '../utils/createGuardedEndpointRule';

export const RULE_NAME = 'graphql-resolvers-should-be-guarded';

export const rule = createGuardedEndpointRule({
  triggerDecorators: ['Query', 'Mutation', 'Subscription'],
  messageId: 'graphqlResolversShouldBeGuarded',
  description:
    'GraphQL root resolvers (Query, Mutation, Subscription) should have authentication guards (UserAuthGuard or WorkspaceAuthGuard) or be explicitly marked as public (PublicEndpointGuard) and permission guards (SettingsPermissionGuard or CustomPermissionGuard) to maintain our security model.',
  message:
    'All GraphQL resolvers must have authentication guards (@UseGuards(UserAuthGuard/WorkspaceAuthGuard)) and permission guards (@UseGuards(..., SettingsPermissionGuard(PermissionFlagType.XXX)), CustomPermissionGuard for custom logic, or NoPermissionGuard for special cases like onboarding).',
});
