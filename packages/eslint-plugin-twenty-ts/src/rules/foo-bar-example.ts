import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://docs.twenty.com`);

const fooBarExampleRule = createRule({
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === "const") {
          for (const variableDeclaration of node.declarations) {
            if (
              variableDeclaration.id.type === AST_NODE_TYPES.Identifier &&
              variableDeclaration.id.name === "foo"
            ) {
              if (
                variableDeclaration.init &&
                variableDeclaration.init.type === AST_NODE_TYPES.Literal &&
                variableDeclaration.init.value !== "bar"
              ) {
                /*
                 * Report error to ESLint. Error message uses
                 * a message placeholder to include the incorrect value
                 * in the error message.
                 * Also includes a `fix(fixer)` function that replaces
                 * any values assigned to `const foo` with "bar".
                 */
                context.report({
                  node,
                  messageId: "fooBar",
                  data: {
                    notBarName: variableDeclaration.id.name,
                    notBarValue: variableDeclaration.init.value,
                  },
                  fix(fixer) {
                    if (variableDeclaration.init) {
                      return fixer.replaceText(
                        variableDeclaration.init,
                        '"bar"',
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
  name: "effect-components",
  meta: {
    docs: {
      description:
        "Foo variables should hold 'bar'.",
    },
    messages: {
      fooBar:
        "Foo variable name {{ notBarName }} should hold bar, instead it holds {{ notBarValue }}.",
    },
    type: "suggestion",
    schema: [],
    fixable: "code",
  },
  defaultOptions: [],
});

module.exports = fooBarExampleRule;

export default fooBarExampleRule;
