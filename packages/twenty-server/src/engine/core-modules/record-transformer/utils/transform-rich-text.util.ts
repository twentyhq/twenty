import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextMetadata,
  richTextValueSchema,
} from 'twenty-shared/types';
import {
  convertBlockNoteToTipTapDocument,
  isDefined,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { convertMarkdownToTipTapDocument } from 'src/engine/core-modules/record-transformer/utils/convert-markdown-to-tiptap-document.util';
import { ensureTipTapSchemaVersion } from 'src/engine/core-modules/record-transformer/utils/ensure-tiptap-schema-version.util';

export const transformRichTextValue = (
  // oxlint-disable-next-line typescript/no-explicit-any
  richTextValue: any,
): RichTextMetadata => {
  const { tiptap, blocknote, markdown }: RichTextMetadata = isNonEmptyString(
    richTextValue,
  )
    ? richTextValueSchema.parse(richTextValue)
    : richTextValue;

  if (isNonEmptyString(tiptap)) {
    const versionedTipTap = ensureTipTapSchemaVersion(tiptap);

    return {
      tiptap: versionedTipTap,
      markdown: tipTapDocumentToMarkdown(versionedTipTap),
      blocknote: null,
    };
  }

  const document =
    (isNonEmptyString(blocknote)
      ? convertBlockNoteToTipTapDocument(blocknote)
      : undefined) ??
    (isNonEmptyString(markdown)
      ? convertMarkdownToTipTapDocument(markdown)
      : undefined);

  if (!isDefined(document)) {
    return { tiptap: null, markdown: null, blocknote: null };
  }

  return {
    tiptap: JSON.stringify(document),
    markdown: isNonEmptyString(markdown)
      ? markdown
      : tipTapDocumentToMarkdown(document),
    blocknote: isNonEmptyString(blocknote) ? blocknote : null,
  };
};
