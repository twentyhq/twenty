import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { collectSourceFingerprints } from '@/app/pull/collect-source-fingerprints';
import { planDependencyWrites } from '@/app/pull/plan-dependency-writes';
import { hashContent } from '@/utils/hash-content';

const files = [
  { folder: 'dependencies', path: 'package.json', content: '{"name":"app"}\n' },
];

describe('planDependencyWrites', () => {
  let appPath: string;
  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-dependencies-'));
  });
  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('records a baseline even when the remote and local dependency already match', async () => {
    await writeFile(join(appPath, 'package.json'), files[0].content);
    const plan = await planDependencyWrites({ appPath, files });
    expect(plan.writes).toEqual([]);
    expect(plan.fingerprints).toEqual({
      'package.json': hashContent(files[0].content),
    });
    expect(plan.unchangedCount).toBe(1);
  });

  it('preserves dependencies edited after apply when the remote contents have not changed', async () => {
    await writeFile(join(appPath, 'package.json'), files[0].content);
    await writeFile(join(appPath, 'yarn.lock'), 'pinned');
    const sourceFingerprints = await collectSourceFingerprints(appPath);
    expect(sourceFingerprints['yarn.lock']).toBe(hashContent('pinned'));
    await writeFile(join(appPath, 'package.json'), '{"name":"local-edit"}');
    const plan = await planDependencyWrites({
      appPath,
      files,
      sourceFingerprints,
    });
    expect(plan.writes).toEqual([]);
    expect(await readFile(join(appPath, 'package.json'), 'utf8')).toBe(
      '{"name":"local-edit"}',
    );
  });

  it('retains the local SDK dev dependency when the custom app only declares runtime dependencies', async () => {
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        devDependencies: { 'twenty-sdk': '2.52.0', 'local-only-tool': '1.0.0' },
      }),
    );
    const plan = await planDependencyWrites({ appPath, files });
    expect(JSON.parse(plan.writes[0].content)).toEqual({
      name: 'app',
      devDependencies: { 'twenty-sdk': '2.52.0' },
    });
    expect(plan.fingerprints['package.json']).toBe(
      hashContent(files[0].content),
    );
    expect(plan.fingerprints['package.json']).not.toBe(
      hashContent(plan.writes[0].content),
    );
  });

  it('uses the remote SDK dependency unchanged when one is exported', async () => {
    await writeFile(
      join(appPath, 'package.json'),
      JSON.stringify({
        devDependencies: { 'twenty-sdk': '2.44.0' },
      }),
    );
    const content = '{"dependencies":{"twenty-sdk":"2.52.0"}}\n';
    const plan = await planDependencyWrites({
      appPath,
      files: [{ ...files[0], content }],
    });
    expect(plan.writes[0].content).toBe(content);
  });

  it('leaves local files in place when no dependency files are exported', async () => {
    await writeFile(join(appPath, 'yarn.lock'), 'local-lock');
    expect((await planDependencyWrites({ appPath, files: [] })).writes).toEqual(
      [],
    );
    expect(await readFile(join(appPath, 'yarn.lock'), 'utf8')).toBe(
      'local-lock',
    );
  });
});
