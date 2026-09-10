import { readFileSync } from 'node:fs';
import { cp, mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { generate } from '../../genql';

// The checked-in client under fixture/generated is the vendored genql engine's
// output for upstream's own integration-test schema (fixture/schema.graphql,
// verbatim from remorses/genql@v3.0.5 integration-tests/). Checking it in lets
// the ported upstream tests import it statically, so their tsd-style type
// assertions are verified by the package typecheck. This test regenerates the
// client and compares byte-for-byte so the fixture can never drift from what
// the engine actually produces.
//
// To refresh after an intentional engine change:
//   UPDATE_GENQL_UPSTREAM_FIXTURE=1 npx vitest run src/generate/__tests__/upstream-3.0.5/generated-fixture-drift.test.ts
const FIXTURE_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixture',
  'generated',
);

const SCHEMA_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixture',
  'schema.graphql',
);

const listFilesRecursively = async (root: string): Promise<string[]> => {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort();
};

describe('upstream fixture client matches the engine output', () => {
  let temporaryDir: string;
  let regeneratedDir: string;

  beforeAll(async () => {
    temporaryDir = await mkdtemp(join(tmpdir(), 'twenty-genql-fixture-'));
    regeneratedDir = join(temporaryDir, 'generated');

    await generate({
      schema: readFileSync(SCHEMA_PATH, 'utf-8'),
      output: regeneratedDir,
    });

    if (
      ['1', 'true'].includes(process.env.UPDATE_GENQL_UPSTREAM_FIXTURE ?? '')
    ) {
      await rm(FIXTURE_DIR, { recursive: true, force: true });
      await cp(regeneratedDir, FIXTURE_DIR, { recursive: true });
    }
  }, 60000);

  afterAll(async () => {
    if (temporaryDir) {
      await rm(temporaryDir, { recursive: true, force: true });
    }
  });

  it('produces the same file list', async () => {
    expect(await listFilesRecursively(regeneratedDir)).toEqual(
      await listFilesRecursively(FIXTURE_DIR),
    );
  });

  it('produces byte-identical file contents', async () => {
    for (const file of await listFilesRecursively(FIXTURE_DIR)) {
      const regenerated = await readFile(join(regeneratedDir, file), 'utf-8');
      const checkedIn = await readFile(join(FIXTURE_DIR, file), 'utf-8');

      expect(regenerated, `fixture/generated/${file} is stale`).toBe(checkedIn);
    }
  });
});
