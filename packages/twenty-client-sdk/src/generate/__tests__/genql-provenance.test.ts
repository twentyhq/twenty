import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

// Guards the vendored genql tree (../genql) with its provenance ledger
// (../genql/provenance.json), which records, for every file, who authored its
// current content: "genql" (upstream @genql/cli code kept near-verbatim,
// frozen by a content hash) or "twenty" (written by Twenty: the orchestration
// rewritten when vendoring, and the README). Failing here means either a file
// was added/removed without a ledger entry, or a "genql" file was edited:
// such edits must be deliberate — typically a ported upstream patch —
// and land with an updated ledger plus a note in ../genql/README.md, never as
// a side effect of another change.
//
// After an intentional change to a "genql" file, refresh the hashes with:
//   UPDATE_GENQL_PROVENANCE=1 npx vitest run src/generate/__tests__/genql-provenance.test.ts
const GENQL_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'genql');

const MANIFEST_PATH = join(GENQL_DIR, 'provenance.json');

type ProvenanceManifest = {
  upstream: {
    package: string;
    version: string;
    repository: string;
    commit: string;
  };
  files: {
    [path: string]: {
      origin: 'genql' | 'twenty';
      sha256?: string;
    };
  };
};

const listFilesRecursively = async (root: string): Promise<string[]> => {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .filter((path) => path !== 'provenance.json')
    .sort();
};

const sha256OfFile = async (path: string): Promise<string> =>
  createHash('sha256')
    .update(await readFile(path))
    .digest('hex');

describe('vendored genql provenance', () => {
  it('lists every vendored file in the ledger, and nothing else', async () => {
    const manifest: ProvenanceManifest = JSON.parse(
      await readFile(MANIFEST_PATH, 'utf-8'),
    );

    const filesOnDisk = await listFilesRecursively(GENQL_DIR);
    const filesInLedger = Object.keys(manifest.files).sort();

    expect(
      filesOnDisk,
      'src/generate/genql and provenance.json disagree; add or remove the ledger entry (with an origin) alongside the file change',
    ).toEqual(filesInLedger);
  });

  it('keeps "genql" files frozen at their recorded content', async () => {
    const manifest: ProvenanceManifest = JSON.parse(
      await readFile(MANIFEST_PATH, 'utf-8'),
    );

    const genqlEntries = Object.entries(manifest.files).filter(
      ([, entry]) => entry.origin === 'genql',
    );

    // every "genql" entry carries a hash, otherwise the freeze is a no-op
    for (const [path, entry] of genqlEntries) {
      expect(entry.sha256, `${path} has no sha256 in provenance.json`).toMatch(
        /^[0-9a-f]{64}$/,
      );
    }

    if (process.env.UPDATE_GENQL_PROVENANCE) {
      for (const [path, entry] of genqlEntries) {
        entry.sha256 = await sha256OfFile(join(GENQL_DIR, path));
      }
      await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

      return;
    }

    for (const [path, entry] of genqlEntries) {
      expect(
        await sha256OfFile(join(GENQL_DIR, path)),
        `genql file ${path} was modified; the vendored upstream code is frozen — if this change is deliberate (e.g. a ported upstream patch), update provenance.json in the same commit and document it in src/generate/genql/README.md`,
      ).toBe(entry.sha256);
    }
  });
});
