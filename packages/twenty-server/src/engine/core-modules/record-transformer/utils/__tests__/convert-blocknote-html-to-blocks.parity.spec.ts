import { join } from 'path';
import { Worker } from 'worker_threads';

import { convertBlockNoteHtmlToBlocks } from 'src/engine/core-modules/record-transformer/utils/convert-blocknote-html-to-blocks.util';

type BlockNoteReference = { html: string; blocks: unknown[] };

// BlockNote only loads as native ESM, which jest cannot import, so the
// reference output is computed in a worker thread.
const computeBlockNoteReferences = (
  markdowns: string[],
): Promise<BlockNoteReference[]> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      join(__dirname, 'blocknote-markdown-reference.worker.mjs'),
      { workerData: { markdowns } },
    );

    worker.once('message', (references: BlockNoteReference[]) => {
      resolve(references);
      void worker.terminate();
    });
    worker.once('error', reject);
  });

const createRandom = (seed: number) => {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);

    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const NOTE_WORDS = [
  'Hello',
  'team',
  'renewal',
  'Q3',
  'pricing',
  'call',
  'with',
  'Alice',
  'contract',
  'R&D',
  '$12k',
  '50%',
  'v2.1',
  'e.g.',
  "it's",
  'snake_case',
  'a+b',
  '(draft)',
];

const EDGE_CASE_WORDS = [
  'a*b',
  '2*3',
  '&amp;',
  '<3',
  'a < b',
  '#tag',
  '1.',
  '\\*',
  '\\_',
  '~',
  '~~',
  '*',
  '**',
  '_',
  '`',
  '[x]',
  '😀',
  '  ',
  '\t',
];

const generateDocument = (random: () => number, words: string[]) => {
  const pick = <TItem>(items: TItem[]): TItem =>
    items[Math.floor(random() * items.length)];

  const inline = (depth = 0): string => {
    const parts: string[] = [];
    const count = 1 + Math.floor(random() * 8);

    for (let index = 0; index < count; index++) {
      const roll = random();
      const word = pick(words);

      if (depth < 2 && roll < 0.08) parts.push(`**${inline(depth + 1)}**`);
      else if (depth < 2 && roll < 0.14) parts.push(`*${inline(depth + 1)}*`);
      else if (depth < 2 && roll < 0.17) parts.push(`_${word}_`);
      else if (depth < 2 && roll < 0.2) parts.push(`~~${inline(depth + 1)}~~`);
      else if (roll < 0.24) parts.push('`' + word + '`');
      else if (depth < 1 && roll < 0.3)
        parts.push(`[${inline(depth + 1)}](https://example.com/${index})`);
      else if (roll < 0.32) parts.push(`***${word}***`);
      else if (roll < 0.34) parts.push('  \n');
      else if (roll < 0.37) parts.push('\n');
      else parts.push(word);
      parts.push(pick([' ', ' ', ' ', '', '  ']));
    }

    return parts.join('').replace(/^\n+/, '');
  };

  const list = (indent: string, depth: number): string => {
    const marker = pick(['-', '*', '1.', '2.', '- [ ]', '- [x]']);
    const lines: string[] = [];
    const count = 1 + Math.floor(random() * 4);

    for (let index = 0; index < count; index++) {
      lines.push(`${indent}${marker} ${inline().replace(/\n/g, ' ')}`);

      if (depth < 2 && random() < 0.25) {
        lines.push(list(`${indent}  `, depth + 1));
      }
    }

    return lines.join('\n');
  };

  const block = (): string => {
    const roll = random();

    if (roll < 0.35) return inline();
    if (roll < 0.47)
      return `${'#'.repeat(1 + Math.floor(random() * 6))} ${inline()}`;
    if (roll < 0.7) return list('', 0);
    if (roll < 0.78) return `> ${inline().replace(/\n/g, ' ')}`;
    if (roll < 0.85)
      return `\`\`\`${pick(['ts', 'sql', 'json'])}\n${inline()}\n\`\`\``;
    if (roll < 0.9) return pick(['---', '***', '___']);

    return `${inline()}\n${inline()}`;
  };

  return Array.from({ length: 1 + Math.floor(random() * 8) }, block).join(
    pick(['\n\n', '\n\n', '\n', '\n\n\n']),
  );
};

const HANDWRITTEN_MARKDOWNS = [
  '',
  '\n\n  \n',
  'Call with Alice, she wants a **demo** next week. See [deck](https://example.com).',
  '# Meeting notes\n\n- Action item for **Alice**\n- Follow up with [Bob](https://example.com/bob)\n  - nested detail\n\n1. First step\n2. Second step\n\n> Quoted reply',
  '3. third\n4. fourth',
  '- [ ] todo\n- [x] done',
  '```ts\nconst a = 1;\n\n  const b = 2;\n```',
  'line  \nbreak\\\nnext',
  '**bold `code` bold** and [link with `code`](https://example.com)',
  '***both*** __bold__ ~~strike~~ snake_case_word',
  '- a\n\n  paragraph in item\n- b',
  'Setext heading\n===\n\nAnother\n---',
];

describe('convertBlockNoteHtmlToBlocks parity with BlockNote', () => {
  it('should produce the same blocks as BlockNote whenever it converts', async () => {
    const random = createRandom(20261002);
    const markdowns = [
      ...HANDWRITTEN_MARKDOWNS,
      ...Array.from({ length: 300 }, () =>
        generateDocument(random, NOTE_WORDS),
      ),
      ...Array.from({ length: 300 }, () =>
        generateDocument(random, [...NOTE_WORDS, ...EDGE_CASE_WORDS]),
      ),
    ];

    const references = await computeBlockNoteReferences(markdowns);

    const withoutIds = (blocks: unknown) =>
      JSON.stringify(blocks, (key, value) =>
        key === 'id' ? undefined : value,
      );

    let convertedCount = 0;

    references.forEach(({ html, blocks }, index) => {
      const conversion = convertBlockNoteHtmlToBlocks(html);

      if (conversion.status !== 'converted') {
        return;
      }

      convertedCount++;

      expect({
        markdown: markdowns[index],
        blocks: withoutIds(conversion.blocks),
      }).toEqual({ markdown: markdowns[index], blocks: withoutIds(blocks) });
    });

    // Guards against the converter silently falling back on everything
    expect(convertedCount).toBeGreaterThan(markdowns.length * 0.6);
  }, 60_000);
});
