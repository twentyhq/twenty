import { ServerBlockNoteEditor } from '@blocknote/server-util';

const serverBlockNoteEditor = ServerBlockNoteEditor.create();

export const convertMarkdownToBlocknote = async (markdown) =>
  JSON.stringify(
    await serverBlockNoteEditor.tryParseMarkdownToBlocks(markdown),
  );

export const convertBlocknoteToMarkdown = async (blocknote) =>
  serverBlockNoteEditor.blocksToMarkdownLossy(JSON.parse(blocknote));
