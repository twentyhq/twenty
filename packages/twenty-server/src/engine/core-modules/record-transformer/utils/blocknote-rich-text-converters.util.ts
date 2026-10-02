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
    options: { shouldRejectRawHtml: boolean },
  ) => Promise<string>;
  convertBlocknoteToMarkdown: (blocknote: string) => Promise<string>;
};

type BlockNoteModules = {
  markdownToHTML: typeof markdownToHTML;
  serverBlockNoteEditor: ServerBlockNoteEditor;
};

// SWC compiles import() to require() in CJS mode, which breaks ESM-only
// transitive dependencies in @blocknote/core. Native import() resolves
// the ESM bundle path where the full chain works.
const nativeImport = new Function('specifier', 'return import(specifier)');

let blockNoteModulesPromise: Promise<BlockNoteModules> | null = null;

const loadBlockNoteModules = (): Promise<BlockNoteModules> => {
  if (!blockNoteModulesPromise) {
    blockNoteModulesPromise = Promise.all([
      nativeImport('@blocknote/core'),
      nativeImport('@blocknote/server-util'),
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
  async (markdown, { shouldRejectRawHtml }) => {
    const { markdownToHTML, serverBlockNoteEditor } =
      await loadBlockNoteModules();

    const conversion = convertBlockNoteHtmlToBlocks(markdownToHTML(markdown));

    if (conversion.status === 'converted') {
      return JSON.stringify(conversion.blocks);
    }

    if (conversion.status === 'raw-html' && shouldRejectRawHtml) {
      throw new RecordTransformerException(
        'Rich text markdown containing raw HTML is not supported when writing several records at once',
        RecordTransformerExceptionCode.RICH_TEXT_RAW_HTML_NOT_SUPPORTED_IN_BATCH,
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
