import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'mdx-component-newlines';

export const rule = defineRule({
  meta: {
    type: 'layout',
    docs: {
      description:
        'Enforce JSX/HTML component tags are on separate lines in MDX files to prevent Crowdin translation issues',
    },
    fixable: 'whitespace',
    messages: {
      tagOnSameLine:
        'JSX/HTML tag should be on its own line. This prevents Crowdin from merging tags with content during translation.',
    },
    schema: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode || (context as any).getSourceCode();

    return {
      JSXOpeningElement: (node: any) => {
        const tokenAfter = sourceCode.getTokenAfter(node as any);

        if (!tokenAfter) {
          return;
        }

        if (node.loc.end.line === tokenAfter.loc.start.line) {
          const nextNode = (sourceCode as any).getNodeByRangeIndex?.(
            tokenAfter.range[0],
          );
          if (nextNode?.type === 'JSXClosingElement') {
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
            node: node as any,
            messageId: 'tagOnSameLine',
            fix: (fixer) => fixer.insertTextAfter(node as any, '\n'),
          });
        }
      },

      JSXClosingElement: (node: any) => {
        const tokenBefore = sourceCode.getTokenBefore(node as any);

        if (!tokenBefore) {
          return;
        }

        if (node.loc.start.line === tokenBefore.loc.end.line) {
          const prevNode = (sourceCode as any).getNodeByRangeIndex?.(
            tokenBefore.range[0],
          );
          if (prevNode?.type === 'JSXOpeningElement') {
            return;
          }

          const textBetween = sourceCode.text.slice(
            tokenBefore.range[1],
            node.range[0],
          );

          if (
            textBetween.trim() !== '' ||
            tokenBefore.type === 'Punctuator'
          ) {
            context.report({
              node: node as any,
              messageId: 'tagOnSameLine',
              fix: (fixer) =>
                fixer.insertTextBefore(node as any, '\n'),
            });
          }
        }
      },
    };
  },
});
