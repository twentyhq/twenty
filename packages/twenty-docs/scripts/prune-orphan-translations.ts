import fs from 'fs';
import path from 'path';

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
} from '../navigation/supported-languages';
import { walkMdxFiles } from './walk-mdx-files';

// Removes orphan localized docs: files under packages/twenty-docs/<lang>/**
// whose corresponding English source page no longer exists. The Crowdin i18n
// pull only ever adds/updates files (never deletes), so when an English page is
// renamed, moved, or removed, its localized copies linger and keep serving
// dead/stale URLs. This keeps the localized tree in sync with the source tree.
//
// DRY-RUN by default (prints what it would remove); pass --apply to delete.
//
// Usage:
//   tsx packages/twenty-docs/scripts/prune-orphan-translations.ts
//   tsx packages/twenty-docs/scripts/prune-orphan-translations.ts --apply

const DOCS_ROOT = path.resolve(__dirname, '..');
const LOCALIZED_DIRECTORIES = SUPPORTED_LANGUAGES.filter(
  (language) => language !== DEFAULT_LANGUAGE,
).map((language) => path.join(DOCS_ROOT, language));

// Safety: never delete a language's localized files wholesale. If more than this
// fraction of a language's files look orphaned, something is wrong (e.g. the
// English source tree wasn't checked out) — abort instead of pruning.
const MAX_ORPHAN_RATIO_PER_LANGUAGE = 0.25;

const apply = process.argv.slice(2).includes('--apply');

const isLocalizedFile = (file: string): boolean =>
  LOCALIZED_DIRECTORIES.some((directory) =>
    file.startsWith(`${directory}${path.sep}`),
  );

// English source path a localized file mirrors: strip the leading `<lang>/`.
const sourcePathOf = (localizedFile: string): string => {
  const segments = path.relative(DOCS_ROOT, localizedFile).split(path.sep);
  // segments[0] is the language code; the rest is the source-relative path.
  return path.join(DOCS_ROOT, ...segments.slice(1));
};

const languageOf = (localizedFile: string): string =>
  path.relative(DOCS_ROOT, localizedFile).split(path.sep)[0];

const main = (): void => {
  const existingLocalizedDirectories = LOCALIZED_DIRECTORIES.filter(
    (directory) => fs.existsSync(directory),
  );

  if (existingLocalizedDirectories.length === 0) {
    console.log('No localized docs directories — nothing to prune.');
    return;
  }

  // Sanity guard: if the English source tree is empty, the checkout is broken;
  // refuse to prune so we never mass-delete translations by mistake.
  const englishFileCount = walkMdxFiles(DOCS_ROOT).filter(
    (file) => !isLocalizedFile(file),
  ).length;

  if (englishFileCount === 0) {
    throw new Error(
      'Refusing to prune: found 0 English source .mdx files (source tree missing?).',
    );
  }

  const localizedFiles = existingLocalizedDirectories.flatMap(walkMdxFiles);
  const orphans = localizedFiles.filter(
    (file) => !fs.existsSync(sourcePathOf(file)),
  );

  if (orphans.length === 0) {
    console.log(
      `No orphan localized files (${localizedFiles.length} scanned).`,
    );
    return;
  }

  // Per-language blast-radius check.
  const filesByLanguage = new Map<string, number>();
  const orphansByLanguage = new Map<string, number>();
  for (const file of localizedFiles) {
    const language = languageOf(file);
    filesByLanguage.set(language, (filesByLanguage.get(language) ?? 0) + 1);
  }
  for (const file of orphans) {
    const language = languageOf(file);
    orphansByLanguage.set(language, (orphansByLanguage.get(language) ?? 0) + 1);
  }

  for (const [language, orphanCount] of orphansByLanguage) {
    const total = filesByLanguage.get(language) ?? 0;
    const ratio = total === 0 ? 1 : orphanCount / total;
    if (ratio > MAX_ORPHAN_RATIO_PER_LANGUAGE) {
      throw new Error(
        `Refusing to prune: ${orphanCount}/${total} (${Math.round(ratio * 100)}%) of "${language}" files look orphaned, ` +
          `over the ${Math.round(MAX_ORPHAN_RATIO_PER_LANGUAGE * 100)}% safety cap. Check the source checkout before pruning.`,
      );
    }
  }

  console.log(
    `${apply ? 'Removing' : 'Would remove'} ${orphans.length} orphan localized file(s) of ${localizedFiles.length} scanned:`,
  );
  for (const file of orphans.sort()) {
    console.log(
      `  ${apply ? 'DELETE' : 'orphan'} ${path.relative(DOCS_ROOT, file)}`,
    );
    if (apply) {
      fs.rmSync(file);
    }
  }

  console.log(
    `${apply ? 'Removed' : 'Would remove'}: ${orphans.length} file(s) across ${orphansByLanguage.size} language(s).`,
  );
};

main();
