import { defineRule } from '@oxlint/plugins';

import { typedTokenHelpers } from '../utils/typedTokenHelpers';

export const RULE_NAME = 'application-target-guards';

const ENDPOINT_DECORATORS = [
  'Query',
  'Mutation',
  'Subscription',
  'ResolveField',
  'Get',
  'Post',
  'Put',
  'Patch',
  'Delete',
  'All',
];

const TARGET_CONFIG_ARGUMENT_INDEX_BY_DECORATOR: Record<string, number> = {
  ApplicationTargetArg: 1,
  ApplicationTargetArgs: 0,
  ApplicationTargetParam: 1,
};

const APPLICATION_TARGET_GUARD = 'ApplicationTargetGuard';
const OWNERSHIP_FLAG = 'requireApplicationRegistrationOwnership';

const getCalleeName = (decorator: any): string | undefined =>
  decorator.expression.type === 'CallExpression' &&
  decorator.expression.callee.type === 'Identifier'
    ? decorator.expression.callee.name
    : undefined;

const getUseGuardsArgumentLists = (node: any): any[][] =>
  (node.decorators ?? [])
    .filter((decorator: any) => getCalleeName(decorator) === 'UseGuards')
    .map((decorator: any) => decorator.expression.arguments);

const isTargetGuard = (guard: any): boolean =>
  guard.type === 'Identifier' && guard.name === APPLICATION_TARGET_GUARD;

const findTargetDecorator = (methodNode: any): any | undefined =>
  (methodNode.value?.params ?? [])
    .flatMap((param: any) => param.decorators ?? [])
    .find(
      (decorator: any) =>
        getCalleeName(decorator) !== undefined &&
        getCalleeName(decorator)! in TARGET_CONFIG_ARGUMENT_INDEX_BY_DECORATOR,
    );

const hasInlineOwnershipFlag = (targetDecorator: any): boolean => {
  const config =
    targetDecorator.expression.arguments[
      TARGET_CONFIG_ARGUMENT_INDEX_BY_DECORATOR[getCalleeName(targetDecorator)!]
    ];

  if (config?.type !== 'ObjectExpression') {
    return false;
  }

  const flag = config.properties.find(
    (property: any) =>
      property.type === 'Property' &&
      !property.computed &&
      property.key.type === 'Identifier' &&
      property.key.name === OWNERSHIP_FLAG,
  );

  return (
    flag?.value.type === 'Literal' && typeof flag.value.value === 'boolean'
  );
};

export const rule = defineRule({
  meta: {
    docs: {
      description:
        'An endpoint that declares an application target lists ApplicationTargetGuard as the last guard of its own topmost @UseGuards, so it runs after its principal and permission guards.',
    },
    messages: {
      missingTargetGuard:
        'This endpoint declares an application target, so its own @UseGuards must end with ApplicationTargetGuard.',
      targetGuardNotLast:
        "ApplicationTargetGuard must be listed once, as the last guard of this endpoint's topmost @UseGuards, so it runs after its principal and permission guards.",
      ownershipFlagNotInline:
        'requireApplicationRegistrationOwnership takes an inline true or false, so the rule of the endpoint can be read at the endpoint.',
      guardWithoutTarget:
        'ApplicationTargetGuard is listed, but this endpoint declares no application target.',
      targetGuardOnClass:
        'ApplicationTargetGuard belongs on each endpoint, after its own guards: guards on the class run before them.',
    },
    schema: [],
    hasSuggestions: false,
    type: 'problem',
  },
  create: (context) => ({
    ClassDeclaration: (node: any): void => {
      for (const guard of getUseGuardsArgumentLists(node).flat()) {
        if (isTargetGuard(guard)) {
          context.report({ node: guard, messageId: 'targetGuardOnClass' });
        }
      }
    },
    MethodDefinition: (node: any): void => {
      if (
        !typedTokenHelpers.nodeHasDecoratorsNamed(node, ENDPOINT_DECORATORS)
      ) {
        return;
      }

      const useGuardsArgumentLists = getUseGuardsArgumentLists(node);
      const listedTargetGuards = useGuardsArgumentLists
        .flat()
        .filter(isTargetGuard);
      const targetDecorator = findTargetDecorator(node);

      if (targetDecorator === undefined) {
        for (const guard of listedTargetGuards) {
          context.report({ node: guard, messageId: 'guardWithoutTarget' });
        }

        return;
      }

      if (!hasInlineOwnershipFlag(targetDecorator)) {
        context.report({
          node: targetDecorator,
          messageId: 'ownershipFlagNotInline',
        });

        return;
      }

      if (listedTargetGuards.length === 0) {
        context.report({ node, messageId: 'missingTargetGuard' });

        return;
      }

      // The topmost @UseGuards is applied last, so its guards run last
      const topmostGuards = useGuardsArgumentLists[0];

      if (
        listedTargetGuards.length > 1 ||
        !isTargetGuard(topmostGuards[topmostGuards.length - 1])
      ) {
        context.report({ node, messageId: 'targetGuardNotLast' });
      }
    },
  }),
});
