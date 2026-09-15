import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  copyReadmeToOutput,
  findReadmeFileName,
} from '@/cli/utilities/build/common/copy-readme-to-output';
import { pathExists } from '@/cli/utilities/file/fs-utils';

describe('findReadmeFileName', () => {
  it('should match readme files regardless of case', () => {
    expect(findReadmeFileName(['README.md'])).toBe('README.md');
    expect(findReadmeFileName(['readme.md'])).toBe('readme.md');
    expect(findReadmeFileName(['Readme.txt'])).toBe('Readme.txt');
    expect(findReadmeFileName(['README'])).toBe('README');
  });

  it('should prefer the markdown readme over other variants', () => {
    expect(findReadmeFileName(['README.txt', 'README.md'])).toBe('README.md');
  });

  it('should ignore unrelated files', () => {
    expect(
      findReadmeFileName(['index.ts', 'package.json', 'readme-notes.md']),
    ).toBeUndefined();
  });
});

describe('copyReadmeToOutput', () => {
  let appPath: string;

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'readme-test-'));
  });

  afterEach(async () => {
    await rm(appPath, { recursive: true, force: true });
  });

  it('should copy the readme into the output directory', async () => {
    await writeFile(join(appPath, 'README.md'), '# My App', 'utf-8');

    await copyReadmeToOutput(appPath);

    const copiedReadme = await readFile(
      join(appPath, OUTPUT_DIR, 'README.md'),
      'utf-8',
    );

    expect(copiedReadme).toBe('# My App');
  });

  it('should do nothing when the app has no readme', async () => {
    await writeFile(join(appPath, 'package.json'), '{}', 'utf-8');

    await copyReadmeToOutput(appPath);

    expect(await pathExists(join(appPath, OUTPUT_DIR))).toBe(false);
  });
});
