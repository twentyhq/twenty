import fs from 'fs';
import path from 'path';

// Removes orphan localized docs: files under packages/twenty-docs/l/<lang>/**
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
const LOCALIZED_DIR = path.join(DOCS_ROOT, 'l');

// Safety: never delete a language's localized files wholesale. If more than this
// fraction of a language's files look orphaned, something is wrong (e.g. the
// English source tree wasn't checked out) — abort instead of pruning.
const MAX_ORPHAN_RATIO_PER_LANGUAGE = 0.25;

const apply = process.argv.slice(2).includes('--apply');

const walkMdxFiles = (dir: string): string[] => {
  const result: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      result.push(...walkMdxFiles(fullPath));
    } else if (entry.endsWith('.mdx')) {
      result.push(fullPath);
    }
  }
  return result;
};

// English source path a localized file mirrors: strip the leading `l/<lang>/`.
const sourcePathOf = (localizedFile: string): string => {
  const relativeToL = path.relative(LOCALIZED_DIR, localizedFile);
  const segments = relativeToL.split(path.sep);
  // segments[0] is the language code; the rest is the source-relative path.
  return path.join(DOCS_ROOT, ...segments.slice(1));
};

const languageOf = (localizedFile: string): string =>
  path.relative(LOCALIZED_DIR, localizedFile).split(path.sep)[0];

const main = (): void => {
  if (!fs.existsSync(LOCALIZED_DIR)) {
    console.log('No localized docs directory (packages/twenty-docs/l) — nothing to prune.');
    return;
  }

  // Sanity guard: if the English source tree is empty, the checkout is broken;
  // refuse to prune so we never mass-delete translations by mistake.
  const englishFileCount = walkMdxFiles(DOCS_ROOT).filter(
    (file) => !file.startsWith(`${LOCALIZED_DIR}${path.sep}`),
  ).length;

  if (englishFileCount === 0) {
    throw new Error(
      'Refusing to prune: found 0 English source .mdx files (source tree missing?).',
    );
  }

  const localizedFiles = walkMdxFiles(LOCALIZED_DIR);
  const orphans = localizedFiles.filter(
    (file) => !fs.existsSync(sourcePathOf(file)),
  );

  if (orphans.length === 0) {
    console.log(`No orphan localized files (${localizedFiles.length} scanned).`);
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
    console.log(`  ${apply ? 'DELETE' : 'orphan'} ${path.relative(DOCS_ROOT, file)}`);
    if (apply) {
      fs.rmSync(file);
    }
  }

  console.log(
    `${apply ? 'Removed' : 'Would remove'}: ${orphans.length} file(s) across ${orphansByLanguage.size} language(s).`,
  );
};

main();
