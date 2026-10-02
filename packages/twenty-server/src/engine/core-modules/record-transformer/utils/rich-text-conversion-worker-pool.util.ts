import { join } from 'path';

import { Piscina } from 'piscina';

import { ASSET_PATH } from 'src/constants/assets-path';

// Markdown <-> BlockNote conversion builds a jsdom document synchronously
// (~3ms per KB of markdown), so it runs off the main thread to keep large
// batch writes from stalling every other request on the pod.
const RICH_TEXT_CONVERSION_WORKER_PATH = join(
  ASSET_PATH,
  'engine/core-modules/record-transformer/rich-text-conversion-worker/index.mjs',
);

let richTextConversionWorkerPool: Piscina | null = null;

const getRichTextConversionWorkerPool = (): Piscina => {
  if (!richTextConversionWorkerPool) {
    richTextConversionWorkerPool = new Piscina({
      filename: RICH_TEXT_CONVERSION_WORKER_PATH,
      minThreads: 1,
      maxThreads: 2,
      idleTimeout: 60_000,
    });
  }

  return richTextConversionWorkerPool;
};

export const convertMarkdownToBlocknoteInWorker = (
  markdown: string,
): Promise<string> =>
  getRichTextConversionWorkerPool().run(markdown, {
    name: 'convertMarkdownToBlocknote',
  });

export const convertBlocknoteToMarkdownInWorker = (
  blocknote: string,
): Promise<string> =>
  getRichTextConversionWorkerPool().run(blocknote, {
    name: 'convertBlocknoteToMarkdown',
  });

export const destroyRichTextConversionWorkerPool = async (): Promise<void> => {
  await richTextConversionWorkerPool?.destroy();
  richTextConversionWorkerPool = null;
};
