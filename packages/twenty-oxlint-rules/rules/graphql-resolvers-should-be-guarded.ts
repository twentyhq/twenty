import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from '../utils/typedTokenHelpers';

export const RULE_NAME = 'graphql-resolvers-should-be-guarded';

export const graphqlResolversShouldBeGuarded = (node: any) => {
  const hasGraphQLResolverDecorator =
    typedTokenHelpers.nodeHasDecoratorsNamed(node, [
      'Query',
      'Mutation',
      'Subscription',
    ]);

  const hasAuthGuards = typedTokenHelpers.nodeHasAuthGuards(node);
  const hasPermissionsGuard =
    typedTokenHelpers.nodeHasPermissionsGuard(node);

  const findClassDeclaration = (node: any): any | null => {
    if (node.type === 'ClassDeclaration') return node;
    if (node.parent) return findClassDeclaration(node.parent);
    return null;
  };

  const classNode = findClassDeclaration(node);

  const hasAuthGuardsOnResolver = classNode
    ? typedTokenHelpers.nodeHasAuthGuards(classNode)
    : false;

  const hasPermissionsGuardOnResolver = classNode
    ? typedTokenHelpers.nodeHasPermissionsGuard(classNode)
    : false;

  const missingAuthGuard =
    hasGraphQLResolverDecorator &&
    !hasAuthGuards &&
    !hasAuthGuardsOnResolver;

  const missingPermissionGuard =
    hasGraphQLResolverDecorator &&
    !hasPermissionsGuard &&
    !hasPermissionsGuardOnResolver;

  return missingAuthGuard || missingPermissionGuard;
};

export const rule = defineRule({
  meta: {
    docs: {
      description:
        'GraphQL root resolvers (Query, Mutation, Subscription) should have authentication guards (UserAuthGuard or WorkspaceAuthGuard) or be explicitly marked as public (PublicEndpointGuard) and permission guards (SettingsPermissionGuard or CustomPermissionGuard) to maintain our security model.',
    },
    messages: {
      graphqlResolversShouldBeGuarded:
        'All GraphQL resolvers must have authentication guards (@UseGuards(UserAuthGuard/WorkspaceAuthGuard)) and permission guards (@UseGuards(..., SettingsPermissionGuard(PermissionFlagType.XXX)), CustomPermissionGuard for custom logic, or NoPermissionGuard for special cases like onboarding).',
    },
    schema: [],
    hasSuggestions: false,
    type: 'suggestion',
  },
  create: (context) => {
    return {
      MethodDefinition: (node: any): void => {
        if (graphqlResolversShouldBeGuarded(node)) {
          context.report({
            node: node,
            messageId: 'graphqlResolversShouldBeGuarded',
          });
        }
      },
    };
  },
});
