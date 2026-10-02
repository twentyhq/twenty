import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'no-icu-escaping-apostrophe';

const MESSAGE_TAG_NAMES = ['t', 'msg', 'defineMessage'];

const getTagName = (tag: any): string | undefined => {
  if (tag.type === 'Identifier') {
    return tag.name;
  }

  // useLingui() returns the macro on an object, so `i18n.t` and `_.t` are extracted like a bare tag
  if (tag.type === 'MemberExpression' && tag.property.type === 'Identifier') {
    return tag.property.name;
  }

  return undefined;
};

const countTrailingApostrophes = (text: string): number => {
  const trailing = /'*$/.exec(text);

  return trailing === null ? 0 : trailing[0].length;
};

// ICU reads an apostrophe before `{` as a quote; apostrophes pair up, so only an odd run swallows the placeholder
const escapesFollowingPlaceholder = (text: string): boolean =>
  countTrailingApostrophes(text) % 2 === 1;

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow an apostrophe directly before a Lingui placeholder, which ICU reads as an escape.',
    },
    messages: {
      escapingApostrophe:
        "An apostrophe directly before a placeholder escapes it: ICU renders the placeholder as literal text instead of substituting the value. Quote the value with double quotes, or double the apostrophe ('') to print one.",
    },
    schema: [],
  },
  create: (context) => ({
    TaggedTemplateExpression: (node: any) => {
      const tagName = getTagName(node.tag);

      if (tagName === undefined || !MESSAGE_TAG_NAMES.includes(tagName)) {
        return;
      }

      node.quasi.quasis.forEach((quasi: any, index: number) => {
        const isFollowedByPlaceholder =
          node.quasi.expressions[index] !== undefined;

        if (!isFollowedByPlaceholder) {
          return;
        }

        const text = quasi.value.cooked ?? quasi.value.raw;

        if (!escapesFollowingPlaceholder(text)) {
          return;
        }

        context.report({ node: quasi, messageId: 'escapingApostrophe' });
      });
    },
  }),
});
