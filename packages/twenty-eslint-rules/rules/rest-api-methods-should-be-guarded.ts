import { TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/createRule';
import { typedTokenHelpers } from '../utils/typedTokenHelpers';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-rest-api-methods-should-be-guarded"
export const RULE_NAME = 'rest-api-methods-should-be-guarded';

export const restApiMethodsShouldBeGuarded = (node: TSESTree.MethodDefinition) => {
  const hasRestApiMethodDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
    node,
    ['Get', 'Post', 'Put', 'Delete', 'Patch', 'Options', 'Head', 'All']
  );

  const hasAuthGuards = typedTokenHelpers.nodeHasAuthGuards(node);
  const hasPermissionsGuard = typedTokenHelpers.nodeHasPermissionsGuard(node);

  const findClassDeclaration = (
    node: TSESTree.Node
  ): TSESTree.ClassDeclaration | null => {
    if (node.type === TSESTree.AST_NODE_TYPES.ClassDeclaration) {
      return node;
    }
    if (node.parent) {
      return findClassDeclaration(node.parent);
    }
    return null;
  }

  const classNode = findClassDeclaration(node);

  const hasAuthGuardsOnController = classNode
    ? typedTokenHelpers.nodeHasAuthGuards(classNode)
    : false;

  const hasPermissionsGuardOnController = classNode
    ? typedTokenHelpers.nodeHasPermissionsGuard(classNode)
    : false;

  // All endpoints need both auth guards and permission guards
  const missingAuthGuard =
    hasRestApiMethodDecorator && !hasAuthGuards && !hasAuthGuardsOnController;

  const missingPermissionGuard =
    hasRestApiMethodDecorator && !hasPermissionsGuard && !hasPermissionsGuardOnController;

  return missingAuthGuard || missingPermissionGuard;
};

export const rule = createRule<[], 'restApiMethodsShouldBeGuarded'>({
  name: RULE_NAME,
  meta: {
    docs: {
      description:
        'REST API endpoints should have authentication guards (UserAuthGuard, WorkspaceAuthGuard, or FilePathGuard) or be explicitly marked as public (PublicEndpointGuard) and permission guards (SettingsPermissionsGuard or CustomPermissionGuard) to maintain our security model.',
    },
    messages: {
      restApiMethodsShouldBeGuarded:
        'All REST API controller endpoints must have authentication guards (@UseGuards(UserAuthGuard/WorkspaceAuthGuard/FilePathGuard/PublicEndpointGuard)) and permission guards (@UseGuards(..., SettingsPermissionsGuard(PermissionFlagType.XXX)), CustomPermissionGuard for custom logic, or NoPermissionGuard for special cases).',
    },
    schema: [],
    hasSuggestions: false,
    type: 'suggestion',
  },
  defaultOptions: [],
  create: (context) => {
    return {
      MethodDefinition: (node: TSESTree.MethodDefinition): void => {
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
