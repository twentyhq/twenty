import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextMetadata,
  richTextValueSchema,
} from 'twenty-shared/types';
import { convertTipTapBlocksToMarkdown, isDefined } from 'twenty-shared/utils';

import type { ServerBlockNoteEditor } from '@blocknote/server-util';

import { convertMarkdownToBlocknoteBlocks } from 'src/engine/core-modules/record-transformer/utils/convert-markdown-to-blocknote-blocks.util';

// Reuse a single ServerBlockNoteEditor across all calls to avoid
// the cost of dynamic import resolution + instance creation (~90ms) on every transform.
let serverBlockNoteEditorPromise: Promise<ServerBlockNoteEditor> | null = null;

const getServerBlockNoteEditor = (): Promise<ServerBlockNoteEditor> => {
  if (!isDefined(serverBlockNoteEditorPromise)) {
    serverBlockNoteEditorPromise = import('@blocknote/server-util')
      .then(({ ServerBlockNoteEditor }) => ServerBlockNoteEditor.create())
      .catch((error) => {
        serverBlockNoteEditorPromise = null;
        throw error;
      });
  }

  return serverBlockNoteEditorPromise;
};

const convertMarkdownToBlocknote = (markdown: string): string =>
  JSON.stringify(convertMarkdownToBlocknoteBlocks(markdown));

// Patch: Handle cases where blocknote to markdown conversion fails for certain block types (custom/code blocks)
// Todo : This may be resolved once the server-utils library is updated with proper conversion support - #947
const convertBlocknoteToMarkdown = async (
  blocknote: string,
): Promise<string> => {
  const serverBlockNoteEditor = await getServerBlockNoteEditor();

  try {
    return await serverBlockNoteEditor.blocksToMarkdownLossy(
      JSON.parse(blocknote),
    );
  } catch {
    return blocknote;
  }
};

export const transformRichTextValue = async (
  // oxlint-disable-next-line typescript/no-explicit-any
  richTextValue: any,
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
      blocknote: convertMarkdownToBlocknote(tipTapMarkdown),
    };
  }

  return {
    markdown:
      parsedValue.markdown ||
      (isNonEmptyString(parsedValue.blocknote)
        ? await convertBlocknoteToMarkdown(parsedValue.blocknote)
        : null),
    blocknote:
      parsedValue.blocknote ||
      (isNonEmptyString(parsedValue.markdown)
        ? convertMarkdownToBlocknote(parsedValue.markdown)
        : null),
  };
};
