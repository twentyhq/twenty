import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from './typedTokenHelpers';

type GuardedEndpointRuleOptions = {
  triggerDecorators: string[];
  messageId: string;
  description: string;
  message: string;
};

const ACCESS_POLICY_GUARD_NOT_FIRST_MESSAGE_ID = 'accessPolicyGuardNotFirst';
const ACCESS_POLICY_GUARD_WITHOUT_POLICY_MESSAGE_ID =
  'accessPolicyGuardWithoutPolicy';
const ACCESS_POLICY_GUARD_ON_CLASS_AND_METHOD_MESSAGE_ID =
  'accessPolicyGuardOnClassAndMethod';

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
      messages: {
        [messageId]: message,
        [ACCESS_POLICY_GUARD_NOT_FIRST_MESSAGE_ID]:
          'AccessPolicyGuard must come first in its @UseGuards list, or right after JwtAuthGuard or McpAuthGuard, so the guards after it only run once the principal is known.',
        [ACCESS_POLICY_GUARD_WITHOUT_POLICY_MESSAGE_ID]:
          'AccessPolicyGuard takes a *_ACCESS_POLICY constant or an inline policy object (no spread, no shorthand).',
        [ACCESS_POLICY_GUARD_ON_CLASS_AND_METHOD_MESSAGE_ID]:
          'An endpoint takes one AccessPolicyGuard: on its class when every endpoint of the class shares the policy, otherwise on each method, never both.',
      },
      schema: [],
      hasSuggestions: false,
      type: 'suggestion',
    },
    create: (context) => {
      const reportAccessPolicyGuardUsage = (node: any): void => {
        for (const guard of typedTokenHelpers.getMisplacedAccessPolicyGuards(
          node,
        )) {
          context.report({
            node: guard,
            messageId: ACCESS_POLICY_GUARD_NOT_FIRST_MESSAGE_ID,
          });
        }

        for (const guard of typedTokenHelpers.getAccessPolicyGuardsWithoutPolicy(
          node,
        )) {
          context.report({
            node: guard,
            messageId: ACCESS_POLICY_GUARD_WITHOUT_POLICY_MESSAGE_ID,
          });
        }
      };

      const reportAccessPolicyGuardOnClassAndMethod = (node: any): void => {
        const classNode = findClassDeclaration(node);

        if (
          !classNode ||
          typedTokenHelpers.getAccessPolicyGuards(classNode).length === 0
        ) {
          return;
        }

        for (const guard of typedTokenHelpers.getAccessPolicyGuards(node)) {
          context.report({
            node: guard,
            messageId: ACCESS_POLICY_GUARD_ON_CLASS_AND_METHOD_MESSAGE_ID,
          });
        }
      };

      return {
        ClassDeclaration: (node: any): void => {
          const hasEndpoint = node.body.body.some(
            (member: any) =>
              member.type === 'MethodDefinition' &&
              typedTokenHelpers.nodeHasDecoratorsNamed(
                member,
                triggerDecorators,
              ),
          );

          if (hasEndpoint) {
            reportAccessPolicyGuardUsage(node);
          }
        },
        MethodDefinition: (node: any): void => {
          if (
            !typedTokenHelpers.nodeHasDecoratorsNamed(node, triggerDecorators)
          ) {
            return;
          }

          reportAccessPolicyGuardUsage(node);
          reportAccessPolicyGuardOnClassAndMethod(node);

          if (isMissingGuards(node, triggerDecorators)) {
            context.report({ node, messageId });
          }
        },
      };
    },
  });
