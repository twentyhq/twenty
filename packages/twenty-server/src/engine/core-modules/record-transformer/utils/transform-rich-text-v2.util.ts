import { isNonEmptyString } from '@sniptt/guards';
import {
  type RichTextV2Metadata,
  richTextV2ValueSchema,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import type { ServerBlockNoteEditor } from '@blocknote/server-util';

// Reuse a single ServerBlockNoteEditor across all calls to avoid
// the cost of dynamic import resolution + instance creation (~90ms) on every transform.
let cachedServerBlockNoteEditor: ServerBlockNoteEditor | null = null;

// SWC compiles import() to require() in CJS mode, which breaks ESM-only
// transitive dependencies in @blocknote/core. Native import() resolves
// the ESM bundle path where the full chain works.
const nativeImport = new Function('specifier', 'return import(specifier)');

const getServerBlockNoteEditor = async (): Promise<ServerBlockNoteEditor> => {
  if (cachedServerBlockNoteEditor) {
    return cachedServerBlockNoteEditor;
  }

  const module = await nativeImport('@blocknote/server-util');
  const editor: ServerBlockNoteEditor = module.ServerBlockNoteEditor.create();

  cachedServerBlockNoteEditor = editor;

  return editor;
};

export const transformRichTextV2Value = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  richTextValue: any,
): Promise<RichTextV2Metadata> => {
  const parsedValue = isNonEmptyString(richTextValue)
    ? richTextV2ValueSchema.parse(richTextValue)
    : richTextValue;

  const serverBlockNoteEditor = await getServerBlockNoteEditor();

  // Patch: Handle cases where blocknote to markdown conversion fails for certain block types (custom/code blocks)
  // Todo : This may be resolved once the server-utils library is updated with proper conversion support - #947
  let convertedMarkdown: string | null = null;

  try {
    convertedMarkdown = isDefined(parsedValue.blocknote)
      ? await serverBlockNoteEditor.blocksToMarkdownLossy(
          JSON.parse(parsedValue.blocknote),
        )
      : null;
  } catch {
    convertedMarkdown = parsedValue.blocknote || null;
  }

  const convertedBlocknote = parsedValue.markdown
    ? JSON.stringify(
        await serverBlockNoteEditor.tryParseMarkdownToBlocks(
          parsedValue.markdown,
        ),
      )
    : null;

  return {
    markdown: parsedValue.markdown || convertedMarkdown,
    blocknote: parsedValue.blocknote || convertedBlocknote,
  };
};
