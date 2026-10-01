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
const APPLICATION_REGISTRATION_OWNERSHIP_GUARD =
  'ApplicationRegistrationOwnershipGuard';
const TARGET_GUARDS = [
  APPLICATION_TARGET_GUARD,
  APPLICATION_REGISTRATION_OWNERSHIP_GUARD,
];
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

const getGuardName = (guard: any): string | undefined =>
  guard.type === 'Identifier' ? guard.name : undefined;

const findTargetDecorator = (methodNode: any): any | undefined =>
  (methodNode.value?.params ?? [])
    .flatMap((param: any) => param.decorators ?? [])
    .find(
      (decorator: any) =>
        getCalleeName(decorator) !== undefined &&
        getCalleeName(decorator)! in TARGET_CONFIG_ARGUMENT_INDEX_BY_DECORATOR,
    );

const readOwnershipFlag = (targetDecorator: any): boolean | undefined => {
  const config =
    targetDecorator.expression.arguments[
      TARGET_CONFIG_ARGUMENT_INDEX_BY_DECORATOR[getCalleeName(targetDecorator)!]
    ];

  if (config?.type !== 'ObjectExpression') {
    return undefined;
  }

  const flag = config.properties.find(
    (property: any) =>
      property.type === 'Property' &&
      !property.computed &&
      property.key.type === 'Identifier' &&
      property.key.name === OWNERSHIP_FLAG,
  );

  return flag?.value.type === 'Literal' && typeof flag.value.value === 'boolean'
    ? flag.value.value
    : undefined;
};

export const rule = defineRule({
  meta: {
    docs: {
      description:
        'An endpoint that declares an application target lists ApplicationTargetGuard, and ApplicationRegistrationOwnershipGuard when it requires registration ownership, as the last guards of its own topmost @UseGuards, so they run after its principal and permission guards.',
    },
    messages: {
      missingTargetGuards:
        'This endpoint declares an application target, so its own @UseGuards must end with {{ guards }}.',
      targetGuardsNotLast:
        "{{ guards }} must be the last guards of this endpoint's topmost @UseGuards, so they run after its principal and permission guards.",
      ownershipGuardWithoutFlag:
        'ApplicationRegistrationOwnershipGuard is listed, but the application target sets requireApplicationRegistrationOwnership: false.',
      ownershipFlagNotInline:
        'requireApplicationRegistrationOwnership takes an inline true or false, so the rule of the endpoint can be read at the endpoint.',
      guardWithoutTarget:
        '{{ guard }} is listed, but this endpoint declares no application target.',
      targetGuardOnClass:
        '{{ guard }} belongs on each endpoint, after its own guards: guards on the class run before them.',
    },
    schema: [],
    hasSuggestions: false,
    type: 'problem',
  },
  create: (context) => ({
    ClassDeclaration: (node: any): void => {
      for (const guard of getUseGuardsArgumentLists(node).flat()) {
        const guardName = getGuardName(guard);

        if (guardName !== undefined && TARGET_GUARDS.includes(guardName)) {
          context.report({
            node: guard,
            messageId: 'targetGuardOnClass',
            data: { guard: guardName },
          });
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
        .filter((guard: any) =>
          TARGET_GUARDS.includes(getGuardName(guard) ?? ''),
        );
      const targetDecorator = findTargetDecorator(node);

      if (targetDecorator === undefined) {
        for (const guard of listedTargetGuards) {
          context.report({
            node: guard,
            messageId: 'guardWithoutTarget',
            data: { guard: getGuardName(guard) },
          });
        }

        return;
      }

      const ownershipFlag = readOwnershipFlag(targetDecorator);

      if (ownershipFlag === undefined) {
        context.report({
          node: targetDecorator,
          messageId: 'ownershipFlagNotInline',
        });

        return;
      }

      const expectedGuards = ownershipFlag
        ? TARGET_GUARDS
        : [APPLICATION_TARGET_GUARD];
      const listedGuardNames = listedTargetGuards.map(getGuardName);

      if (
        !ownershipFlag &&
        listedGuardNames.includes(APPLICATION_REGISTRATION_OWNERSHIP_GUARD)
      ) {
        context.report({ node, messageId: 'ownershipGuardWithoutFlag' });

        return;
      }

      if (expectedGuards.some((guard) => !listedGuardNames.includes(guard))) {
        context.report({
          node,
          messageId: 'missingTargetGuards',
          data: { guards: expectedGuards.join(', ') },
        });

        return;
      }

      // The topmost @UseGuards is applied last, so its guards run last
      const topmostGuardNames = useGuardsArgumentLists[0].map(getGuardName);
      const isLast =
        listedTargetGuards.length === expectedGuards.length &&
        topmostGuardNames
          .slice(-expectedGuards.length)
          .every((guardName, index) => guardName === expectedGuards[index]);

      if (!isLast) {
        context.report({
          node,
          messageId: 'targetGuardsNotLast',
          data: { guards: expectedGuards.join(', ') },
        });
      }
    },
  }),
});
