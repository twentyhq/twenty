import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-window-open';

const isWindowOpenCallee = (callee: any): boolean =>
  callee.type === 'MemberExpression' &&
  callee.object.type === 'Identifier' &&
  callee.object.name === 'window' &&
  ((!callee.computed &&
    callee.property.type === 'Identifier' &&
    callee.property.name === 'open') ||
    (callee.computed &&
      callee.property.type === 'Literal' &&
      callee.property.value === 'open'));

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow window.open() so new tabs are always opened without access to the Twenty tab.',
    },
    messages: {
      noWindowOpen:
        "Use openUrlInNewTab from '~/utils/openUrlInNewTab' instead of window.open(): it sets noopener and noreferrer so the opened page cannot navigate the Twenty tab.",
    },
    schema: [],
  },
  create: (context) => ({
    CallExpression: (node: any) => {
      if (isWindowOpenCallee(node.callee)) {
        context.report({ node, messageId: 'noWindowOpen' });
      }
    },
  }),
});
