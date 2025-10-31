import { isDefined } from 'twenty-shared/utils';

import {
  type RichTextV2Metadata,
  richTextV2ValueSchema,
} from 'src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type';

export const transformRichTextV2Value = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  richTextValue: any,
): Promise<RichTextV2Metadata> => {
  const parsedValue = richTextV2ValueSchema.parse(richTextValue);

  const { ServerBlockNoteEditor } = await import('@blocknote/server-util');

  const serverBlockNoteEditor = ServerBlockNoteEditor.create();

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
