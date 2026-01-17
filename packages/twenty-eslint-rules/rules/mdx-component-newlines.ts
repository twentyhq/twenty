import type { TSESTree } from '@typescript-eslint/utils';
import type { Rule } from 'eslint';

export const RULE_NAME = 'mdx-component-newlines';

export const rule: Rule.RuleModule = {
  meta: {
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
  },

  create: (context) => {
    const sourceCode = context.sourceCode || context.getSourceCode();

    return {
      // Check JSX opening tags that have content on the same line
      JSXOpeningElement: (node: TSESTree.JSXOpeningElement) => {
        const tokenAfter = sourceCode.getTokenAfter(node as any);

        if (!tokenAfter) {
          return;
        }

        // Check if there's content on the same line after the opening tag
        if (node.loc.end.line === tokenAfter.loc.start.line) {
          // Allow if it's a closing tag immediately after (self-closing pattern)
          const nextNode = (sourceCode as any).getNodeByRangeIndex?.(
            tokenAfter.range[0],
          );
          if (nextNode?.type === 'JSXClosingElement') {
            return;
          }

          // Check if it's actual content (not whitespace)
          const textBetween = sourceCode.text.slice(
            node.range[1],
            tokenAfter.range[0],
          );
          if (textBetween.trim() === '') {
            return; // Only whitespace, that's fine
          }

          context.report({
            node: node as any,
            messageId: 'tagOnSameLine',
            fix: (fixer) => fixer.insertTextAfter(node as any, '\n'),
          });
        }
      },

      // Check JSX closing tags that have content on the same line before them
      JSXClosingElement: (node: TSESTree.JSXClosingElement) => {
        const tokenBefore = sourceCode.getTokenBefore(node as any);

        if (!tokenBefore) {
          return;
        }

        // Check if there's content on the same line before the closing tag
        if (node.loc.start.line === tokenBefore.loc.end.line) {
          // Check if it's actual content (not whitespace or opening tag)
          const prevNode = (sourceCode as any).getNodeByRangeIndex?.(
            tokenBefore.range[0],
          );
          if (prevNode?.type === 'JSXOpeningElement') {
            return; // This is handled by the opening tag check
          }

          const textBetween = sourceCode.text.slice(
            tokenBefore.range[1],
            node.range[0],
          );

          // If there's any non-whitespace content before the closing tag on same line
          if (textBetween.trim() !== '' || tokenBefore.type === 'Punctuator') {
            context.report({
              node: node as any,
              messageId: 'tagOnSameLine',
              fix: (fixer) => fixer.insertTextBefore(node as any, '\n'),
            });
          }
        }
      },
    };
  },
};

