import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isIdentifier } from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-matching-state-variable"
export const RULE_NAME = 'matching-state-variable';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure recoil value and setter are named after their atom name',
      recommended: 'recommended',
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
          node?.init?.type === AST_NODE_TYPES.CallExpression &&
          isIdentifier(node.init.callee) &&
          [
            'useRecoilState',
            'useRecoilScopedState',
            'useRecoilFamilyState',
            'useRecoilScopedFamilyState',
            'useRecoilValue',
            'useRecoilScopedValue',
          ].includes(node.init.callee.name)
        ) {
          const stateNameBase = isIdentifier(node.init.arguments[0])
            ? node.init.arguments[0].name
            : undefined;

          if (!stateNameBase) {
            return;
          }

          const expectedVariableNameBase = stateNameBase.replace(
            /(State|FamilyState|Selector|ScopedState|ScopedFamilyState|ScopedSelector)$/,
            '',
          );

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
                  callee: node.init.callee.name,
                },
                fix: (fixer) => {
                  return fixer.replaceText(node.id, expectedVariableNameBase);
                },
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
                  actual: actualVariableName,
                  expected: expectedVariableNameBase,
                  callee: node.init.callee.name,
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
              const expectedSetterName = `set${expectedVariableNameBase
                .charAt(0)
                .toUpperCase()}${expectedVariableNameBase.slice(1)}`;

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
        }
      },
    };
  },
});
