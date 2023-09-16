import { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure Recoil value and setter are named after their atom name',
      category: 'Possible Errors',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create: (context) => ({
    VariableDeclarator(node) {
      if (
        node?.init?.callee?.name &&
        typeof node.init.callee.name === 'string' &&
        [
          'useRecoilState',
          'useRecoilFamilyState',
          'useRecoilSelector',
          'useRecoilScopedState',
          'useRecoilScopedFamilyState',
          'useRecoilScopedSelector',
          'useRecoilValue',
        ].includes(node.init.callee.name)
      ) {
        const stateNameBase = node.init.arguments?.[0].name;

        if (!stateNameBase) {
          return;
        }

        let expectedVariableNameBase = stateNameBase.replace(
          /(State|FamilyState|Selector|ScopedState|ScopedFamilyState|ScopedSelector)$/,
          ''
        );

        if (node.id.type === 'Identifier') {
          const actualVariableName = node.id.name;
          if (actualVariableName !== expectedVariableNameBase) {
            context.report({
              node,
              message: `Invalid usage of ${node.init.callee.name}: the value should be named '${expectedVariableNameBase}' but found '${actualVariableName}'.`,
              fix(fixer) {
                return fixer.replaceText(node.id, expectedVariableNameBase);
              },
            });
          }
          return;
        }

        if (node.id.type === 'ArrayPattern') {
          const actualVariableName = node.id.elements?.[0]?.name;

          if (
            actualVariableName &&
            actualVariableName !== expectedVariableNameBase
          ) {
            context.report({
              node,
              message: `Invalid usage of ${node.init.callee.name}: the value should be named '${expectedVariableNameBase}' but found '${actualVariableName}'.`,
              fix(fixer) {
                return fixer.replaceText(
                  node.id.elements[0],
                  expectedVariableNameBase
                );
              },
            });
            return;
          }

          if (node.id.elements?.[1]?.name) {
            const actualSetterName = node.id.elements[1].name;
            const expectedSetterName = `set${expectedVariableNameBase
              .charAt(0)
              .toUpperCase()}${expectedVariableNameBase.slice(1)}`;

            if (actualSetterName !== expectedSetterName) {
              context.report({
                node,
                message: `Invalid usage of ${node.init.callee.name}: Expected setter '${expectedSetterName}' but found '${actualSetterName}'.`,
                fix(fixer) {
                  return fixer.replaceText(
                    node.id.elements[1],
                    expectedSetterName
                  );
                },
              });
            }
          }
        }
      }
    },
  }),
};

export default rule;
