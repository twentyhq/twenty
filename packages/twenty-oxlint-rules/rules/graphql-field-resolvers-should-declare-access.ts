import { defineRule } from '@oxlint/plugins';

import { createGuardedEndpointRule } from '../utils/createGuardedEndpointRule';
import { typedTokenHelpers } from '../utils/typedTokenHelpers';

export const RULE_NAME = 'graphql-field-resolvers-should-declare-access';

const ROOT_OPERATION_DECORATOR_NAMES = ['Query', 'Mutation', 'Subscription'];
const RESOLVE_FIELD_DECORATOR_NAMES = ['ResolveField'];

const CLASS_GUARD_ON_ROOTS_AND_FIELDS_MESSAGE_ID =
  'classGuardOnRootsAndFieldResolvers';

const guardedFieldResolverRule = createGuardedEndpointRule({
  triggerDecorators: RESOLVE_FIELD_DECORATOR_NAMES,
  messageId: 'graphqlFieldResolversShouldDeclareAccess',
  description:
    'GraphQL field resolvers (ResolveField) should declare who may resolve them with AccessPolicyGuard, or NoPermissionGuard when the field adds no check of its own.',
  message:
    'All GraphQL field resolvers must have an AccessPolicyGuard (@UseGuards(AccessPolicyGuard(SOME_ACCESS_POLICY)) or an inline policy) or a NoPermissionGuard on the method or its class.',
  isDeclaringAccess: typedTokenHelpers.nodeHasAccessPolicyOrNoPermissionGuard,
});

const hasMemberDecoratedWith = (classNode: any, decoratorNames: string[]) =>
  classNode.body.body.some(
    (member: any) =>
      member.type === 'MethodDefinition' &&
      typedTokenHelpers.nodeHasDecoratorsNamed(member, decoratorNames),
  );

export const rule = defineRule({
  meta: {
    ...guardedFieldResolverRule.meta,
    messages: {
      ...guardedFieldResolverRule.meta.messages,
      [CLASS_GUARD_ON_ROOTS_AND_FIELDS_MESSAGE_ID]:
        'Class guards run on every field resolver of the class too. Move the @ResolveField methods to their own @Resolver class, or the guards onto the root operations.',
    },
  },
  create: (context) => {
    const visitors = guardedFieldResolverRule.create(context);

    return {
      ...visitors,
      ClassDeclaration: (node: any): void => {
        const hasRootOperations = hasMemberDecoratedWith(
          node,
          ROOT_OPERATION_DECORATOR_NAMES,
        );

        // The root rule already reports class-level guard issues on a class with root operations
        if (!hasRootOperations) {
          visitors.ClassDeclaration?.(node);

          return;
        }

        if (!hasMemberDecoratedWith(node, RESOLVE_FIELD_DECORATOR_NAMES)) {
          return;
        }

        for (const decorator of typedTokenHelpers.getUseGuardsDecorators(
          node,
        )) {
          context.report({
            node: decorator,
            messageId: CLASS_GUARD_ON_ROOTS_AND_FIELDS_MESSAGE_ID,
          });
        }
      },
    };
  },
});
