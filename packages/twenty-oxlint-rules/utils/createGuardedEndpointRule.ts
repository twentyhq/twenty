import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from './typedTokenHelpers';

type GuardedEndpointRuleOptions = {
  triggerDecorators: string[];
  messageId: string;
  description: string;
  message: string;
};

const findClassDeclaration = (node: any): any | null => {
  if (node.type === 'ClassDeclaration') return node;
  if (node.parent) return findClassDeclaration(node.parent);

  return null;
};

const isMissingGuards = (node: any, triggerDecorators: string[]) => {
  const hasTriggerDecorator = typedTokenHelpers.nodeHasDecoratorsNamed(
    node,
    triggerDecorators,
  );

  const classNode = findClassDeclaration(node);

  const missingAuthGuard =
    hasTriggerDecorator &&
    !typedTokenHelpers.nodeHasAuthGuards(node) &&
    !(classNode ? typedTokenHelpers.nodeHasAuthGuards(classNode) : false);

  const missingPermissionGuard =
    hasTriggerDecorator &&
    !typedTokenHelpers.nodeHasPermissionsGuard(node) &&
    !(classNode ? typedTokenHelpers.nodeHasPermissionsGuard(classNode) : false);

  return missingAuthGuard || missingPermissionGuard;
};

export const createGuardedEndpointRule = ({
  triggerDecorators,
  messageId,
  description,
  message,
}: GuardedEndpointRuleOptions) =>
  defineRule({
    meta: {
      docs: { description },
      messages: { [messageId]: message },
      schema: [],
      hasSuggestions: false,
      type: 'suggestion',
    },
    create: (context) => {
      return {
        MethodDefinition: (node: any): void => {
          if (isMissingGuards(node, triggerDecorators)) {
            context.report({ node, messageId });
          }
        },
      };
    },
  });
