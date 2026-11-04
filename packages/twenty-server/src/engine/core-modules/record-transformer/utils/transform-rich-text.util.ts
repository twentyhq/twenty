import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextMetadata,
  richTextValueSchema,
} from 'twenty-shared/types';
import {
  convertBlockNoteToRichTextDocument,
  isDefined,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { convertMarkdownToRichTextDocument } from 'src/engine/core-modules/record-transformer/utils/convert-markdown-to-rich-text-document.util';
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

  const blockNoteDocument = isNonEmptyString(blocknote)
    ? convertBlockNoteToRichTextDocument(blocknote)
    : undefined;

  if (isDefined(blockNoteDocument)) {
    return {
      tiptap: JSON.stringify(blockNoteDocument),
      markdown: tipTapDocumentToMarkdown(blockNoteDocument),
      blocknote,
    };
  }

  const markdownDocument = isNonEmptyString(markdown)
    ? convertMarkdownToRichTextDocument(markdown)
    : undefined;

  if (!isDefined(markdownDocument)) {
    return { tiptap: null, markdown: null, blocknote: null };
  }

  return {
    tiptap: JSON.stringify(markdownDocument),
    markdown,
    blocknote: null,
  };
};
