import { parentPort, workerData } from 'node:worker_threads';

import { markdownToHTML } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';

const serverBlockNoteEditor = ServerBlockNoteEditor.create();

const references = [];

for (const markdown of workerData.markdowns) {
  references.push({
    html: markdownToHTML(markdown),
    blocks: await serverBlockNoteEditor.tryParseMarkdownToBlocks(markdown),
  });
}

parentPort.postMessage(references);
