import type { markdownToHTML } from '@blocknote/core';
import type { ServerBlockNoteEditor } from '@blocknote/server-util';

import {
  RecordTransformerException,
  RecordTransformerExceptionCode,
} from 'src/engine/core-modules/record-transformer/record-transformer.exception';
import { convertBlockNoteHtmlToBlocks } from 'src/engine/core-modules/record-transformer/utils/convert-blocknote-html-to-blocks.util';

export type RichTextConverters = {
  convertMarkdownToBlocknote: (
    markdown: string,
    options: { shouldRejectSlowConversion: boolean },
  ) => Promise<string>;
  convertBlocknoteToMarkdown: (blocknote: string) => Promise<string>;
};

type BlockNoteModules = {
  markdownToHTML: typeof markdownToHTML;
  serverBlockNoteEditor: ServerBlockNoteEditor;
};

let blockNoteModulesPromise: Promise<BlockNoteModules> | null = null;

const loadBlockNoteModules = (): Promise<BlockNoteModules> => {
  if (!blockNoteModulesPromise) {
    blockNoteModulesPromise = Promise.all([
      import('@blocknote/core'),
      import('@blocknote/server-util'),
    ])
      .then(([blockNoteCore, blockNoteServerUtil]) => ({
        markdownToHTML: blockNoteCore.markdownToHTML,
        serverBlockNoteEditor:
          blockNoteServerUtil.ServerBlockNoteEditor.create(),
      }))
      .catch((error) => {
        blockNoteModulesPromise = null;
        throw error;
      });
  }

  return blockNoteModulesPromise;
};

// The jsdom-based ServerBlockNoteEditor parse costs ~3ms per KB on the main
// thread, so markdown goes through the DOM-free conversion whenever it can.
const convertMarkdownToBlocknote: RichTextConverters['convertMarkdownToBlocknote'] =
  async (markdown, { shouldRejectSlowConversion }) => {
    const { markdownToHTML, serverBlockNoteEditor } =
      await loadBlockNoteModules();

    const conversion = convertBlockNoteHtmlToBlocks(markdownToHTML(markdown));

    if (conversion.status === 'converted') {
      return JSON.stringify(conversion.blocks);
    }

    if (shouldRejectSlowConversion) {
      throw new RecordTransformerException(
        conversion.status === 'raw-html'
          ? 'Rich text markdown containing raw HTML is not supported when writing several records at once'
          : 'Rich text markdown with tables, images, multi-paragraph quotes or code blocks without a language is not supported when writing several records at once',
        RecordTransformerExceptionCode.RICH_TEXT_CONTENT_NOT_SUPPORTED_IN_BATCH,
      );
    }

    return JSON.stringify(
      await serverBlockNoteEditor.tryParseMarkdownToBlocks(markdown),
    );
  };

const convertBlocknoteToMarkdown: RichTextConverters['convertBlocknoteToMarkdown'] =
  async (blocknote) => {
    const { serverBlockNoteEditor } = await loadBlockNoteModules();

    return serverBlockNoteEditor.blocksToMarkdownLossy(JSON.parse(blocknote));
  };

export const BLOCKNOTE_RICH_TEXT_CONVERTERS: RichTextConverters = {
  convertMarkdownToBlocknote,
  convertBlocknoteToMarkdown,
};
