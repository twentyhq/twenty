import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-matching-state-variable"
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

const ALL_HOOKS = [...VALUE_HOOKS, ...STATE_HOOKS, ...SETTER_HOOKS];

const SUFFIX_PATTERN =
  /(ComponentFamilyState|ComponentState|ScopedFamilyState|FamilyState|ScopedState|ScopedSelector|Selector|State)$/;

const getExpectedBaseName = (stateArgName: string): string =>
  stateArgName.replace(SUFFIX_PATTERN, '');

const getExpectedSetterName = (baseName: string): string =>
  `set${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}`;

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
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
  defaultOptions: [],
  create: (context) => {
    return {
      VariableDeclarator: (node: TSESTree.VariableDeclarator) => {
        if (
          node?.init?.type !== AST_NODE_TYPES.CallExpression ||
          !isIdentifier(node.init.callee) ||
          !ALL_HOOKS.includes(node.init.callee.name)
        ) {
          return;
        }

        const hookName = node.init.callee.name;

        const stateNameBase = isIdentifier(node.init.arguments[0])
          ? node.init.arguments[0].name
          : undefined;

        if (!stateNameBase) {
          return;
        }

        const expectedVariableNameBase = getExpectedBaseName(stateNameBase);

        if (SETTER_HOOKS.includes(hookName)) {
          if (isIdentifier(node.id)) {
            const actualName = node.id.name;
            const expectedSetterName =
              getExpectedSetterName(expectedVariableNameBase);

            if (actualName !== expectedSetterName) {
              context.report({
                node,
                messageId: 'invalidSetterName',
                data: {
                  hookName: stateNameBase,
                  actualName,
                  expectedName: expectedSetterName,
                },
                fix: (fixer) => fixer.replaceText(node.id, expectedSetterName),
              });
            }
          }

          return;
        }

        if (VALUE_HOOKS.includes(hookName)) {
          if (isIdentifier(node.id)) {
            const actualName = node.id.name;

            if (actualName !== expectedVariableNameBase) {
              context.report({
                node,
                messageId: 'invalidVariableName',
                data: {
                  actualName,
                  expectedName: expectedVariableNameBase,
                  hookName: stateNameBase,
                  callee: hookName,
                },
                fix: (fixer) =>
                  fixer.replaceText(node.id, expectedVariableNameBase),
              });
            }
          }

          return;
        }

        if (isIdentifier(node.id)) {
          const actualVariableName = node.id.name;

          if (actualVariableName !== expectedVariableNameBase) {
            context.report({
              node,
              messageId: 'invalidVariableName',
              data: {
                actualName: actualVariableName,
                expectedName: expectedVariableNameBase,
                hookName: stateNameBase,
                callee: hookName,
              },
              fix: (fixer) =>
                fixer.replaceText(node.id, expectedVariableNameBase),
            });
          }

          return;
        }

        if (node.id.type === AST_NODE_TYPES.ArrayPattern) {
          const actualVariableName =
            node.id.elements?.[0]?.type === AST_NODE_TYPES.Identifier
              ? node.id.elements[0].name
              : undefined;

          if (
            actualVariableName &&
            actualVariableName !== expectedVariableNameBase
          ) {
            context.report({
              node,
              messageId: 'invalidVariableName',
              data: {
                actualName: actualVariableName,
                expectedName: expectedVariableNameBase,
                hookName: stateNameBase,
                callee: hookName,
              },
              fix: (fixer) => {
                if (node.id.type === AST_NODE_TYPES.ArrayPattern) {
                  return fixer.replaceText(
                    node.id.elements[0] as TSESTree.Node,
                    expectedVariableNameBase,
                  );
                }
                return null;
              },
            });
          }

          if (isIdentifier(node.id.elements[1])) {
            const actualSetterName = node.id.elements[1].name;
            const expectedSetterName =
              getExpectedSetterName(expectedVariableNameBase);

            if (actualSetterName !== expectedSetterName) {
              context.report({
                node,
                messageId: 'invalidSetterName',
                data: {
                  hookName: stateNameBase,
                  actualName: actualSetterName,
                  expectedName: expectedSetterName,
                },
                fix: (fixer) => {
                  if (node.id.type === AST_NODE_TYPES.ArrayPattern) {
                    return fixer.replaceText(
                      node.id.elements[1]!,
                      expectedSetterName,
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
