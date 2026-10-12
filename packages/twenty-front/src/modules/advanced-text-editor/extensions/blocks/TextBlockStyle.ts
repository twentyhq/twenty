import { readBlockStyleAttribute } from '@/advanced-text-editor/extensions/blocks/readBlockStyleAttribute';
import { inlineStyleToCss } from '@/advanced-text-editor/utils/inlineStyleToCss';
import { Extension } from '@tiptap/core';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const TextBlockStyle = Extension.create({
  name: 'textBlockStyle',

  addGlobalAttributes() {
    return [
      {
        types: [TIPTAP_NODE_TYPES.PARAGRAPH, TIPTAP_NODE_TYPES.HEADING],
        attributes: {
          style: {
            default: null,
            parseHTML: readBlockStyleAttribute,
            renderHTML: (attributes) =>
              isDefined(attributes.style)
                ? {
                    style: inlineStyleToCss(attributes.style),
                    'data-style': JSON.stringify(attributes.style),
                  }
                : {},
          },
        },
      },
    ];
  },
});
