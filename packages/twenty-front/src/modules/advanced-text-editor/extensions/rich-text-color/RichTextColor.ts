import { isNonEmptyString } from '@sniptt/guards';
import { Extension } from '@tiptap/core';
import {
  type RichTextColor as RichTextColorName,
  TIPTAP_MARK_TYPES,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type RichTextColorAttributes = {
  textColor?: RichTextColorName | null;
  backgroundColor?: RichTextColorName | null;
};

export const RichTextColor = Extension.create({
  name: 'richTextColor',

  addGlobalAttributes: () => [
    {
      types: [TIPTAP_MARK_TYPES.TEXT_STYLE],
      attributes: {
        textColor: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-text-color'),
          renderHTML: ({
            textColor,
          }: Pick<RichTextColorAttributes, 'textColor'>) =>
            isNonEmptyString(textColor)
              ? {
                  'data-text-color': textColor,
                  style: `color: var(--editor-text-color-${textColor}, ${themeCssVariables.color[textColor]})`,
                }
              : {},
        },
        backgroundColor: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-background-color'),
          renderHTML: ({
            backgroundColor,
          }: Pick<RichTextColorAttributes, 'backgroundColor'>) =>
            isNonEmptyString(backgroundColor)
              ? {
                  'data-background-color': backgroundColor,
                  style: `background-color: var(--editor-background-color-${backgroundColor}, ${themeCssVariables.color[`${backgroundColor}3`]})`,
                }
              : {},
        },
      },
    },
  ],
});
