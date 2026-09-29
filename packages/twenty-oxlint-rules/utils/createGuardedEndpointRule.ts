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
const CALLER_GUARDS_SHARE_NO_CALLER_MESSAGE_ID = 'callerGuardsShareNoCaller';

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
        [CALLER_GUARDS_SHARE_NO_CALLER_MESSAGE_ID]:
          'The class-level and method-level CallerGuard configs accept no caller in common, so every request to this endpoint is refused.',
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

      const reportCallerGuardsSharingNoCaller = (node: any): void => {
        const classNode = findClassDeclaration(node);

        if (!classNode) {
          return;
        }

        const methodCallerGuards =
          typedTokenHelpers.getInlineCallerGuards(node);
        const callerGuards = [
          ...typedTokenHelpers.getInlineCallerGuards(classNode),
          ...methodCallerGuards,
        ];

        if (methodCallerGuards.length === 0 || callerGuards.length < 2) {
          return;
        }

        const acceptedCallerVariantsByGuard = callerGuards.map(
          typedTokenHelpers.getAcceptedCallerVariants,
        );

        // A guard that accepts nobody on its own is reported separately.
        if (
          acceptedCallerVariantsByGuard.some(
            (acceptedCallerVariants) => acceptedCallerVariants.length === 0,
          )
        ) {
          return;
        }

        const sharedCallerVariants = acceptedCallerVariantsByGuard.reduce(
          (shared, acceptedCallerVariants) =>
            shared.filter((callerVariant) =>
              acceptedCallerVariants.includes(callerVariant),
            ),
        );

        if (sharedCallerVariants.length === 0) {
          context.report({
            node: methodCallerGuards[0],
            messageId: CALLER_GUARDS_SHARE_NO_CALLER_MESSAGE_ID,
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
          reportCallerGuardsSharingNoCaller(node);

          if (isMissingGuards(node, triggerDecorators)) {
            context.report({ node, messageId });
          }
        },
      };
    },
  });
