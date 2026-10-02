import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextMetadata,
  richTextValueSchema,
} from 'twenty-shared/types';
import { convertTipTapBlocksToMarkdown, isDefined } from 'twenty-shared/utils';

import {
  BLOCKNOTE_RICH_TEXT_CONVERTERS,
  type RichTextConverters,
} from 'src/engine/core-modules/record-transformer/utils/blocknote-rich-text-converters.util';

export const transformRichTextValue = async (
  // oxlint-disable-next-line typescript/no-explicit-any
  richTextValue: any,
  {
    shouldRejectSlowConversion = false,
    converters = BLOCKNOTE_RICH_TEXT_CONVERTERS,
  }: {
    shouldRejectSlowConversion?: boolean;
    converters?: RichTextConverters;
  } = {},
): Promise<RichTextMetadata> => {
  const parsedValue = isNonEmptyString(richTextValue)
    ? richTextValueSchema.parse(richTextValue)
    : richTextValue;

  const tipTapMarkdown = isDefined(parsedValue.blocknote)
    ? convertTipTapBlocksToMarkdown(parsedValue.blocknote)
    : undefined;

  if (isDefined(tipTapMarkdown)) {
    return {
      markdown: parsedValue.markdown || tipTapMarkdown,
      blocknote: await converters.convertMarkdownToBlocknote(tipTapMarkdown, {
        shouldRejectSlowConversion,
      }),
    };
  }

  const markdown =
    parsedValue.markdown ||
    (isNonEmptyString(parsedValue.blocknote)
      ? await converters.convertBlocknoteToMarkdown(parsedValue.blocknote)
      : null);

  const blocknote =
    parsedValue.blocknote ||
    (parsedValue.markdown
      ? await converters.convertMarkdownToBlocknote(parsedValue.markdown, {
          shouldRejectSlowConversion,
        })
      : null);

  return { markdown, blocknote };
};
