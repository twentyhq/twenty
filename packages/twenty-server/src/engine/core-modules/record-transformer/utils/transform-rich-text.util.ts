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
    shouldRejectRawHtml = false,
    converters = BLOCKNOTE_RICH_TEXT_CONVERTERS,
  }: {
    shouldRejectRawHtml?: boolean;
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
        shouldRejectRawHtml,
      }),
    };
  }

  const markdown =
    parsedValue.markdown ||
    (await convertBlocknoteToMarkdownOrFallback(
      parsedValue.blocknote,
      converters,
    ));

  const blocknote =
    parsedValue.blocknote ||
    (parsedValue.markdown
      ? await converters.convertMarkdownToBlocknote(parsedValue.markdown, {
          shouldRejectRawHtml,
        })
      : null);

  return { markdown, blocknote };
};

// Patch: Handle cases where blocknote to markdown conversion fails for certain block types (custom/code blocks)
// Todo : This may be resolved once the server-utils library is updated with proper conversion support - #947
const convertBlocknoteToMarkdownOrFallback = async (
  blocknote: string | null | undefined,
  converters: RichTextConverters,
): Promise<string | null> => {
  if (!isNonEmptyString(blocknote)) {
    return null;
  }

  try {
    return await converters.convertBlocknoteToMarkdown(blocknote);
  } catch {
    return blocknote;
  }
};
