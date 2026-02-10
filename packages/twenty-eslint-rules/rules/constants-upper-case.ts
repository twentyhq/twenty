import type { Rule } from 'eslint';

export const RULE_NAME = 'constants-upper-case';

const UPPER_CASE_RE = /^[A-Z][A-Z0-9_]*$/;

export const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce SCREAMING_SNAKE_CASE for top-level const declarations in constants files',
    },
    messages: {
      notUpperCase:
        'Constant "{{ name }}" should be in SCREAMING_SNAKE_CASE (e.g. MY_CONSTANT).',
    },
    schema: [],
  },
  create: (context) => {
    return {
      VariableDeclarator: (node) => {
        if (node.id.type !== 'Identifier') return;
        const declaration = node.parent;
        if (
          !declaration ||
          declaration.type !== 'VariableDeclaration' ||
          declaration.kind !== 'const'
        )
          return;

        const declarationParent = declaration.parent;
        if (
          !declarationParent ||
          (declarationParent.type !== 'Program' &&
            declarationParent.type !== 'ExportNamedDeclaration')
        ) {
          return;
        }

        const name = node.id.name;

        if (!UPPER_CASE_RE.test(name)) {
          context.report({
            node: node.id,
            messageId: 'notUpperCase',
            data: { name },
          });
        }
      },
    };
  },
};
