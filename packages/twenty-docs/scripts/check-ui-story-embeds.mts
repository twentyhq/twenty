import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isNonEmptyString } from '@sniptt/guards';

import { checkStoryEmbeds } from './ui/check-story-embeds.mjs';

const indexPath = process.argv[2];

if (!isNonEmptyString(indexPath)) {
  throw new Error('Pass the path to the generated Storybook index.json.');
}

const index: { entries: Record<string, { id: string; type: string }> } =
  JSON.parse(readFileSync(resolve(indexPath), 'utf8'));
const storyIds = new Set(
  Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id),
);
const documentationRoot = fileURLToPath(new URL('..', import.meta.url));
const pages = globSync(
  ['ui/**/*.mdx', 'l/*/ui/**/*.mdx', 'snippets/ui/**/*.mdx'],
  { cwd: documentationRoot },
).sort();
const errors = pages.flatMap((page) =>
  checkStoryEmbeds({
    content: readFileSync(resolve(documentationRoot, page), 'utf8'),
    storyIds,
  }).map((error) => `${page}: ${error}`),
);

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Checked UI documentation embeds against ${storyIds.size} Storybook stories.\n`,
  );
}
