import type { TSESTree } from '@typescript-eslint/utils';
import type { Rule } from 'eslint';

export const RULE_NAME = 'mdx-component-newlines';

const asEslintNode = (node: TSESTree.Node) =>
  node as unknown as Rule.Node;

const meta = {
  type: 'layout',
  docs: {
    description:
      'Enforce JSX/HTML component tags are on separate lines in MDX files to prevent Crowdin translation issues',
    recommended: true,
  },
  fixable: 'whitespace',
  messages: {
    tagOnSameLine:
      'JSX/HTML tag should be on its own line. This prevents Crowdin from merging tags with content during translation.',
  },
  schema: [],
} satisfies Rule.RuleMetaData;

export const rule = {
  meta,

  create: (context: Rule.RuleContext) => {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      JSXOpeningElement: (node: TSESTree.JSXOpeningElement) => {
        const eslintNode = asEslintNode(node);
        const tokenAfter = sourceCode.getTokenAfter(eslintNode);

        if (!tokenAfter) {
          return;
        }

        if (node.loc.end.line === tokenAfter.loc.start.line) {
          if (tokenAfter.type as string === 'JSXClosingElement') {
            return;
          }

          const textBetween = sourceCode.text.slice(
            node.range[1],
            tokenAfter.range[0],
          );
          if (textBetween.trim() === '') {
            return;
          }

          context.report({
            node: eslintNode,
            messageId: 'tagOnSameLine',
            fix: (fixer) => fixer.insertTextAfter(eslintNode, '\n'),
          });
        }
      },

      JSXClosingElement: (node: TSESTree.JSXClosingElement) => {
        const eslintNode = asEslintNode(node);
        const tokenBefore = sourceCode.getTokenBefore(eslintNode);

        if (!tokenBefore) {
          return;
        }

        if (node.loc.start.line === tokenBefore.loc.end.line) {
          if (tokenBefore.type as string === 'JSXOpeningElement') {
            return;
          }

          const textBetween = sourceCode.text.slice(
            tokenBefore.range[1],
            node.range[0],
          );

          if (textBetween.trim() !== '' || tokenBefore.type === 'Punctuator') {
            context.report({
              node: eslintNode,
              messageId: 'tagOnSameLine',
              fix: (fixer) => fixer.insertTextBefore(eslintNode, '\n'),
            });
          }
        }
      },
    };
  },
};
