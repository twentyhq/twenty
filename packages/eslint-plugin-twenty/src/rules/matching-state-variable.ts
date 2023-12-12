import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(() => `https://docs.twenty.com`);

const matchingStateVariableRule = createRule({
  create: (context) => {
    return {
      VariableDeclarator: (node: TSESTree.VariableDeclarator) => {
        if (
          node?.init?.type === AST_NODE_TYPES.CallExpression &&
          node.init.callee.type === AST_NODE_TYPES.Identifier &&
          [
            "useRecoilState",
            "useRecoilScopedState",
            "useRecoilFamilyState",
            "useRecoilScopedFamilyState",
            "useRecoilValue",
            "useRecoilScopedValue",
          ].includes(node.init.callee.name)
        ) {
          const stateNameBase =
            node.init.arguments?.[0]?.type === AST_NODE_TYPES.Identifier
              ? node.init.arguments[0].name
              : undefined;

          if (!stateNameBase) {
            return;
          }

          const expectedVariableNameBase = stateNameBase.replace(
            /(State|FamilyState|Selector|ScopedState|ScopedFamilyState|ScopedSelector)$/,
            "",
          );

          if (node.id.type === AST_NODE_TYPES.Identifier) {
            const actualVariableName = node.id.name;
            if (actualVariableName !== expectedVariableNameBase) {
              context.report({
                node,
                messageId: "invalidVariableName",
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
                messageId: "invalidVariableName",
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

            if (node.id.elements?.[1]?.type === AST_NODE_TYPES.Identifier) {
              const actualSetterName = node.id.elements[1].name;
              const expectedSetterName = `set${expectedVariableNameBase
                .charAt(0)
                .toUpperCase()}${expectedVariableNameBase.slice(1)}`;

              if (actualSetterName !== expectedSetterName) {
                context.report({
                  node,
                  messageId: "invalidSetterName",
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
  name: "recoil-hook-naming",
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure recoil value and setter are named after their atom name",
      recommended: "recommended",
    },
    fixable: "code",
    schema: [],
    messages: {
      invalidVariableName:
        "Invalid usage of {{ hookName }}: the variable should be named '{{ expectedName }}' but found '{{ actualName }}'.",
      invalidSetterName:
        "Invalid usage of {{ hookName }}: Expected setter '{{ expectedName }}' but found '{{ actualName }}'.",
    },
  },
  defaultOptions: [],
});

module.exports = matchingStateVariableRule;

export default matchingStateVariableRule;
