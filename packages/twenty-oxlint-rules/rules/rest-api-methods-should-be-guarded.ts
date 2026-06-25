import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from '../utils/typedTokenHelpers';

export const RULE_NAME = 'rest-api-methods-should-be-guarded';

export const restApiMethodsShouldBeGuarded = (node: any) => {
  const hasRestApiMethodDecorator =
    typedTokenHelpers.nodeHasDecoratorsNamed(node, [
      'Get',
      'Post',
      'Put',
      'Delete',
      'Patch',
      'Options',
      'Head',
      'All',
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

  const hasAuthGuardsOnController = classNode
    ? typedTokenHelpers.nodeHasAuthGuards(classNode)
    : false;

  const hasPermissionsGuardOnController = classNode
    ? typedTokenHelpers.nodeHasPermissionsGuard(classNode)
    : false;

  const missingAuthGuard =
    hasRestApiMethodDecorator &&
    !hasAuthGuards &&
    !hasAuthGuardsOnController;

  const missingPermissionGuard =
    hasRestApiMethodDecorator &&
    !hasPermissionsGuard &&
    !hasPermissionsGuardOnController;

  return missingAuthGuard || missingPermissionGuard;
};

export const rule = defineRule({
  meta: {
    docs: {
      description:
        'REST API endpoints should have authentication guards (UserAuthGuard, WorkspaceAuthGuard, FilePathGuard, FileByIdGuard) or be explicitly marked as public (PublicEndpointGuard) and permission guards (SettingsPermissionGuard or CustomPermissionGuard) to maintain our security model.',
    },
    messages: {
      restApiMethodsShouldBeGuarded:
        'All REST API controller endpoints must have authentication guards (@UseGuards(...)) and permission guards (@UseGuards(..., SettingsPermissionGuard(...)), CustomPermissionGuard, or NoPermissionGuard).',
    },
    schema: [],
    hasSuggestions: false,
    type: 'suggestion',
  },
  create: (context) => {
    return {
      MethodDefinition: (node: any): void => {
        if (restApiMethodsShouldBeGuarded(node)) {
          context.report({
            node: node,
            messageId: 'restApiMethodsShouldBeGuarded',
          });
        }
      },
    };
  },
});
