import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from './typedTokenHelpers';

type GuardedEndpointRuleOptions = {
  triggerDecorators: string[];
  messageId: string;
  description: string;
  message: string;
};

const REPLACED_CALLER_GUARD_MESSAGE_ID = 'replacedCallerGuard';
const CALLER_GUARD_CONFIG_NOT_INLINE_MESSAGE_ID = 'callerGuardConfigNotInline';
const CALLER_GUARD_ACCEPTS_NO_CALLER_MESSAGE_ID = 'callerGuardAcceptsNoCaller';

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
        [REPLACED_CALLER_GUARD_MESSAGE_ID]:
          '{{ guardName }} was replaced by CallerGuard: declare the callers this endpoint accepts with CallerGuard({ ... }).',
        [CALLER_GUARD_CONFIG_NOT_INLINE_MESSAGE_ID]:
          'CallerGuard takes an inline object literal (no variable, no spread) so the accepted callers can be read at the endpoint.',
        [CALLER_GUARD_ACCEPTS_NO_CALLER_MESSAGE_ID]:
          'CallerGuard refuses every caller: accept at least one caller kind.',
      },
      schema: [],
      hasSuggestions: false,
      type: 'suggestion',
    },
    create: (context) => {
      const reportCallerGuardUsage = (node: any): void => {
        for (const guard of typedTokenHelpers.getReplacedCallerGuards(node)) {
          context.report({
            node: guard,
            messageId: REPLACED_CALLER_GUARD_MESSAGE_ID,
            data: { guardName: guard.name },
          });
        }

        for (const guard of typedTokenHelpers.getCallerGuardsWithoutInlineConfig(
          node,
        )) {
          context.report({
            node: guard,
            messageId: CALLER_GUARD_CONFIG_NOT_INLINE_MESSAGE_ID,
          });
        }

        for (const guard of typedTokenHelpers.getCallerGuardsAcceptingNoCaller(
          node,
        )) {
          context.report({
            node: guard,
            messageId: CALLER_GUARD_ACCEPTS_NO_CALLER_MESSAGE_ID,
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
            reportCallerGuardUsage(node);
          }
        },
        MethodDefinition: (node: any): void => {
          if (
            !typedTokenHelpers.nodeHasDecoratorsNamed(node, triggerDecorators)
          ) {
            return;
          }

          reportCallerGuardUsage(node);

          if (isMissingGuards(node, triggerDecorators)) {
            context.report({ node, messageId });
          }
        },
      };
    },
  });
