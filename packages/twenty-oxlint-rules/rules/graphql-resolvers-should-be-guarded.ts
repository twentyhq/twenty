import { createGuardedEndpointRule } from '../utils/createGuardedEndpointRule';

export const RULE_NAME = 'graphql-resolvers-should-be-guarded';

export const rule = createGuardedEndpointRule({
  triggerDecorators: ['Query', 'Mutation', 'Subscription'],
  messageId: 'graphqlResolversShouldBeGuarded',
  description:
    'GraphQL root resolvers (Query, Mutation, Subscription) should declare who can call them and which flags they need with AccessPolicyGuard, or be explicitly marked as public (PublicEndpointGuard) with a permission guard such as NoPermissionGuard.',
  message:
    'All GraphQL resolvers must have an AccessPolicyGuard (@UseGuards(AccessPolicyGuard(SOME_ACCESS_POLICY)) or an inline policy) on the method or its class, or be marked as public with PublicEndpointGuard and NoPermissionGuard.',
});
