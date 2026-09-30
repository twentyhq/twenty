import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from './typedTokenHelpers';

type GuardedEndpointRuleOptions = {
  triggerDecorators: string[];
  messageId: string;
  description: string;
  message: string;
};

const REPLACED_AUTH_GUARD_MESSAGE_ID = 'replacedByAuthPrincipalGuard';
const AUTH_PRINCIPAL_GUARD_CONFIG_NOT_INLINE_MESSAGE_ID =
  'authPrincipalGuardConfigNotInline';
const AUTH_PRINCIPAL_GUARD_WIDER_THAN_CLASS_MESSAGE_ID =
  'authPrincipalGuardWiderThanClass';
const AUTH_PRINCIPAL_GUARD_NOT_FIRST_MESSAGE_ID = 'authPrincipalGuardNotFirst';

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
        [REPLACED_AUTH_GUARD_MESSAGE_ID]:
          '{{ guardName }} was replaced by AuthPrincipalGuard: declare the principals this endpoint accepts with AuthPrincipalGuard({ ... }).',
        [AUTH_PRINCIPAL_GUARD_CONFIG_NOT_INLINE_MESSAGE_ID]:
          'AuthPrincipalGuard takes an inline object literal (no variable, no spread, no shorthand) so the principals an endpoint accepts can be read at the endpoint.',
        [AUTH_PRINCIPAL_GUARD_WIDER_THAN_CLASS_MESSAGE_ID]:
          'This method-level AuthPrincipalGuard accepts {{ principalVariants }}, which the class-level AuthPrincipalGuard refuses: a method can only narrow what its class accepts.',
        [AUTH_PRINCIPAL_GUARD_NOT_FIRST_MESSAGE_ID]:
          'AuthPrincipalGuard must come first in its @UseGuards list, or right after JwtAuthGuard or McpAuthGuard, so the guards after it only run once the principal is known.',
      },
      schema: [],
      hasSuggestions: false,
      type: 'suggestion',
    },
    create: (context) => {
      const reportAuthPrincipalGuardUsage = (node: any): void => {
        for (const guard of typedTokenHelpers.getReplacedAuthGuards(node)) {
          context.report({
            node: guard,
            messageId: REPLACED_AUTH_GUARD_MESSAGE_ID,
            data: { guardName: guard.name },
          });
        }

        for (const guard of typedTokenHelpers.getAuthPrincipalGuardsWithoutInlineConfig(
          node,
        )) {
          context.report({
            node: guard,
            messageId: AUTH_PRINCIPAL_GUARD_CONFIG_NOT_INLINE_MESSAGE_ID,
          });
        }

        for (const guard of typedTokenHelpers.getMisplacedAuthPrincipalGuards(
          node,
        )) {
          context.report({
            node: guard,
            messageId: AUTH_PRINCIPAL_GUARD_NOT_FIRST_MESSAGE_ID,
          });
        }
      };

      const reportMethodGuardWiderThanClassGuard = (node: any): void => {
        const classNode = findClassDeclaration(node);

        if (!classNode) {
          return;
        }

        const classGuards =
          typedTokenHelpers.getInlineAuthPrincipalGuards(classNode);

        if (classGuards.length === 0) {
          return;
        }

        const isAcceptedByClass = (principalVariant: string): boolean =>
          classGuards.every((classGuard: any) =>
            typedTokenHelpers
              .getAcceptedPrincipalVariants(classGuard)
              .includes(principalVariant),
          );

        for (const methodGuard of typedTokenHelpers.getInlineAuthPrincipalGuards(
          node,
        )) {
          const principalVariantsRefusedByClass = typedTokenHelpers
            .getAcceptedPrincipalVariants(methodGuard)
            .filter((principalVariant) => !isAcceptedByClass(principalVariant));

          if (principalVariantsRefusedByClass.length > 0) {
            context.report({
              node: methodGuard,
              messageId: AUTH_PRINCIPAL_GUARD_WIDER_THAN_CLASS_MESSAGE_ID,
              data: {
                principalVariants: principalVariantsRefusedByClass.join(', '),
              },
            });
          }
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
            reportAuthPrincipalGuardUsage(node);
          }
        },
        MethodDefinition: (node: any): void => {
          if (
            !typedTokenHelpers.nodeHasDecoratorsNamed(node, triggerDecorators)
          ) {
            return;
          }

          reportAuthPrincipalGuardUsage(node);
          reportMethodGuardWiderThanClassGuard(node);

          if (isMissingGuards(node, triggerDecorators)) {
            context.report({ node, messageId });
          }
        },
      };
    },
  });
