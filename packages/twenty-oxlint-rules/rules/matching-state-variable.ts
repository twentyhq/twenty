import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'matching-state-variable';

const VALUE_HOOKS = [
  'useAtomStateValue',
  'useAtomComponentStateValue',
  'useAtomFamilyStateValue',
  'useAtomComponentFamilyStateValue',
];

const STATE_HOOKS = [
  'useAtomState',
  'useAtomComponentState',
  'useAtomComponentFamilyState',
];

const SETTER_HOOKS = [
  'useSetAtomState',
  'useSetAtomComponentState',
  'useSetAtomFamilyState',
  'useSetAtomComponentFamilyState',
];

const FAMILY_HOOKS = new Set([
  'useAtomFamilyStateValue',
  'useAtomComponentFamilyStateValue',
  'useAtomFamilyState',
  'useAtomComponentFamilyState',
  'useSetAtomFamilyState',
  'useSetAtomComponentFamilyState',
]);

const ALL_HOOKS = [...VALUE_HOOKS, ...STATE_HOOKS, ...SETTER_HOOKS];

const SUFFIX_PATTERN =
  /(ComponentFamilyState|ComponentState|ScopedFamilyState|FamilyState|ScopedState|ScopedSelector|Selector|State)$/;

const getExpectedBaseName = (stateArgName: string): string =>
  stateArgName.replace(SUFFIX_PATTERN, '');

const getExpectedSetterName = (baseName: string): string =>
  `set${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}`;

// For family hooks, a string-literal family key may be appended to the base
// name to disambiguate reads of the same family in the same scope. e.g.
// `useAtomFamilyStateValue(metadataStoreState, 'views')` accepts either
// `metadataStore` or `metadataStoreViews` as the variable name.
const getFamilyKeyVariants = (
  hookName: string,
  args: ReadonlyArray<any> | undefined,
): string[] => {
  if (!FAMILY_HOOKS.has(hookName) || !args) {
    return [];
  }

  const familyKeyArg = args[1];

  if (
    familyKeyArg?.type !== 'Literal' ||
    typeof familyKeyArg.value !== 'string' ||
    familyKeyArg.value.length === 0
  ) {
    return [];
  }

  const keyValue = familyKeyArg.value;

  return [`${keyValue.charAt(0).toUpperCase()}${keyValue.slice(1)}`];
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure state value and setter are named after their atom name',
    },
    fixable: 'code',
    schema: [],
    messages: {
      invalidVariableName:
        "Invalid usage of {{ hookName }}: the variable should be named '{{ expectedName }}' but found '{{ actualName }}'.",
      invalidSetterName:
        "Invalid usage of {{ hookName }}: Expected setter '{{ expectedName }}' but found '{{ actualName }}'.",
    },
  },
  create: (context) => {
    return {
      VariableDeclarator: (node: any) => {
        if (
          node?.init?.type !== 'CallExpression' ||
          node.init.callee?.type !== 'Identifier' ||
          !ALL_HOOKS.includes(node.init.callee.name)
        ) {
          return;
        }

        const hookName = node.init.callee.name;

        const stateNameBase =
          node.init.arguments[0]?.type === 'Identifier'
            ? node.init.arguments[0].name
            : undefined;

        if (!stateNameBase) {
          return;
        }

        const expectedVariableNameBase = getExpectedBaseName(stateNameBase);

        const familyKeySuffixes = getFamilyKeyVariants(
          hookName,
          node.init.arguments,
        );

        const acceptedVariableNames = [
          expectedVariableNameBase,
          ...familyKeySuffixes.map(
            (suffix) => `${expectedVariableNameBase}${suffix}`,
          ),
        ];

        const acceptedSetterNames = acceptedVariableNames.map(
          getExpectedSetterName,
        );

        if (SETTER_HOOKS.includes(hookName)) {
          if (node.id?.type === 'Identifier') {
            const actualName = node.id.name;

            if (!acceptedSetterNames.includes(actualName)) {
              context.report({
                node,
                messageId: 'invalidSetterName',
                data: {
                  hookName: stateNameBase,
                  actualName,
                  expectedName: acceptedSetterNames[0],
                },
                fix: (fixer) =>
                  fixer.replaceText(node.id, acceptedSetterNames[0]),
              });
            }
          }

          return;
        }

        if (VALUE_HOOKS.includes(hookName)) {
          if (node.id?.type === 'Identifier') {
            const actualName = node.id.name;

            if (!acceptedVariableNames.includes(actualName)) {
              context.report({
                node,
                messageId: 'invalidVariableName',
                data: {
                  actualName,
                  expectedName: acceptedVariableNames[0],
                  hookName: stateNameBase,
                  callee: hookName,
                },
                fix: (fixer) =>
                  fixer.replaceText(node.id, acceptedVariableNames[0]),
              });
            }
          }

          return;
        }

        if (node.id?.type === 'Identifier') {
          const actualVariableName = node.id.name;

          if (!acceptedVariableNames.includes(actualVariableName)) {
            context.report({
              node,
              messageId: 'invalidVariableName',
              data: {
                actualName: actualVariableName,
                expectedName: acceptedVariableNames[0],
                hookName: stateNameBase,
                callee: hookName,
              },
              fix: (fixer) =>
                fixer.replaceText(node.id, acceptedVariableNames[0]),
            });
          }

          return;
        }

        if (node.id.type === 'ArrayPattern') {
          const actualVariableName =
            node.id.elements?.[0]?.type === 'Identifier'
              ? node.id.elements[0].name
              : undefined;

          if (
            actualVariableName &&
            !acceptedVariableNames.includes(actualVariableName)
          ) {
            context.report({
              node,
              messageId: 'invalidVariableName',
              data: {
                actualName: actualVariableName,
                expectedName: acceptedVariableNames[0],
                hookName: stateNameBase,
                callee: hookName,
              },
              fix: (fixer) => {
                if (node.id.type === 'ArrayPattern') {
                  return fixer.replaceText(
                    node.id.elements[0] as any,
                    acceptedVariableNames[0],
                  );
                }
                return null;
              },
            });
          }

          if (node.id.elements[1]?.type === 'Identifier') {
            const actualSetterName = node.id.elements[1].name;

            if (!acceptedSetterNames.includes(actualSetterName)) {
              context.report({
                node,
                messageId: 'invalidSetterName',
                data: {
                  hookName: stateNameBase,
                  actualName: actualSetterName,
                  expectedName: acceptedSetterNames[0],
                },
                fix: (fixer) => {
                  if (node.id.type === 'ArrayPattern') {
                    return fixer.replaceText(
                      node.id.elements[1]!,
                      acceptedSetterNames[0],
                    );
                  }
                  return null;
                },
              });
            }
          }
        }
      },
    };
  },
});
