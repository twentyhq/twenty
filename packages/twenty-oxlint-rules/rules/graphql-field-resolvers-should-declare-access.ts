import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from '../utils/typedTokenHelpers';

export const RULE_NAME = 'graphql-field-resolvers-should-declare-access';

const MISSING_ACCESS_MESSAGE_ID = 'graphqlFieldResolversShouldDeclareAccess';
const CLASS_GUARD_ON_FIELD_RESOLVER_CLASS_MESSAGE_ID =
  'classGuardOnFieldResolverClass';

const RESOLVE_FIELD_DECORATOR_NAMES = ['ResolveField'];

const isFieldResolverMethod = (member: any): boolean =>
  member.type === 'MethodDefinition' &&
  typedTokenHelpers.nodeHasDecoratorsNamed(
    member,
    RESOLVE_FIELD_DECORATOR_NAMES,
  );

export const rule = defineRule({
  meta: {
    docs: {
      description:
        'GraphQL field resolvers (ResolveField) should declare on the method who may resolve them, with AccessPolicyGuard, or NoPermissionGuard for the same access as the parent object.',
    },
    messages: {
      [MISSING_ACCESS_MESSAGE_ID]:
        'Every @ResolveField method must carry @UseGuards(AccessPolicyGuard(SOME_ACCESS_POLICY)) or @UseGuards(NoPermissionGuard) (same access as the parent object) on the method itself; a class-level guard does not count.',
      [CLASS_GUARD_ON_FIELD_RESOLVER_CLASS_MESSAGE_ID]:
        'Class guards run on every field resolver of the class. Move the @ResolveField methods to their own @Resolver class, or the guards onto the root operations.',
    },
    schema: [],
    hasSuggestions: false,
    type: 'suggestion',
  },
  create: (context) => ({
    ClassDeclaration: (node: any): void => {
      if (!node.body.body.some(isFieldResolverMethod)) {
        return;
      }

      for (const decorator of typedTokenHelpers.getUseGuardsDecorators(node)) {
        context.report({
          node: decorator,
          messageId: CLASS_GUARD_ON_FIELD_RESOLVER_CLASS_MESSAGE_ID,
        });
      }
    },
    MethodDefinition: (node: any): void => {
      if (
        isFieldResolverMethod(node) &&
        !typedTokenHelpers.nodeHasAccessPolicyOrNoPermissionGuard(node)
      ) {
        context.report({ node, messageId: MISSING_ACCESS_MESSAGE_ID });
      }
    },
  }),
});
