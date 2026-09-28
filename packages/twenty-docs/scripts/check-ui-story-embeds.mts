import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isNonEmptyString } from '@sniptt/guards';

import { checkStoryEmbeds } from './ui/check-story-embeds.mjs';
import { checkStoryPresentation } from './ui/check-story-presentation.mjs';

const indexPath = process.argv[2];

if (!isNonEmptyString(indexPath)) {
  throw new Error('Pass the path to the generated Storybook index.json.');
}

const index: {
  entries: Record<
    string,
    {
      id: string;
      type: string;
      tags?: string[];
      importPath: string;
      exportName: string;
    }
  >;
} = JSON.parse(readFileSync(resolve(indexPath), 'utf8'));
const storyIds = new Set(
  Object.values(index.entries)
    .filter((entry) => entry.type === 'story')
    .map((entry) => entry.id),
);
const storiesWithPlayFunctions = new Set(
  Object.values(index.entries)
    .filter((entry) => entry.tags?.includes('play-fn'))
    .map((entry) => entry.id),
);
const documentationRoot = fileURLToPath(new URL('..', import.meta.url));
const storyErrors = new Map<string, string[]>();
const getPresentationErrors = (storyId: string): string[] => {
  const cachedErrors = storyErrors.get(storyId);

  if (cachedErrors) {
    return cachedErrors;
  }

  const entry = index.entries[storyId];
  const sourcePath = resolve(
    documentationRoot,
    '../twenty-ui',
    entry.importPath,
  );
  const errors = checkStoryPresentation({
    content: readFileSync(sourcePath, 'utf8'),
    exportName: entry.exportName,
    fileName: sourcePath,
  });

  storyErrors.set(storyId, errors);

  return errors;
};
const pages = globSync(['ui/**/*.mdx', '*/ui/**/*.mdx', 'l/*/ui/**/*.mdx'], {
  cwd: documentationRoot,
}).sort();
const errors = pages.flatMap((page) =>
  checkStoryEmbeds({
    content: readFileSync(resolve(documentationRoot, page), 'utf8'),
    storyIds,
    storiesWithPlayFunctions,
    getPresentationErrors,
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
