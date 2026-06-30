import { mkdtemp, readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import os from 'node:os';

import {
  copy,
  emptyDir,
  ensureDir,
  ensureFile,
  move,
  pathExists,
  pathExistsSync,
  readJson,
  remove,
  writeJson,
} from '@/cli/utilities/file/fs-utils';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(os.tmpdir(), 'fs-utils-test-'));
});

afterEach(async () => {
  await remove(tmpDir);
});

describe('pathExists', () => {
  it('should return true for an existing file', async () => {
    const filePath = join(tmpDir, 'exists.txt');
    await writeFile(filePath, 'hello');

    expect(await pathExists(filePath)).toBe(true);
  });

  it('should return false for a non-existent path', async () => {
    expect(await pathExists(join(tmpDir, 'nope.txt'))).toBe(false);
  });
});

describe('pathExistsSync', () => {
  it('should return true for an existing directory', () => {
    expect(pathExistsSync(tmpDir)).toBe(true);
  });

  it('should return false for a non-existent path', () => {
    expect(pathExistsSync(join(tmpDir, 'nope'))).toBe(false);
  });
});

describe('ensureDir', () => {
  it('should create a deeply nested directory', async () => {
    const deepPath = join(tmpDir, 'a', 'b', 'c');

    await ensureDir(deepPath);

    expect(existsSync(deepPath)).toBe(true);
    const dirStat = await stat(deepPath);
    expect(dirStat.isDirectory()).toBe(true);
  });

  it('should not throw when the directory already exists', async () => {
    await expect(ensureDir(tmpDir)).resolves.not.toThrow();
  });
});

describe('ensureFile', () => {
  it('should create the file and parent directories when missing', async () => {
    const filePath = join(tmpDir, 'deep', 'nested', 'file.txt');

    await ensureFile(filePath);

    expect(existsSync(filePath)).toBe(true);
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('');
  });

  it('should not overwrite an existing file', async () => {
    const filePath = join(tmpDir, 'existing.txt');
    await writeFile(filePath, 'keep me');

    await ensureFile(filePath);

    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('keep me');
  });
});

describe('emptyDir', () => {
  it('should remove all contents including nested subdirectories', async () => {
    await writeFile(join(tmpDir, 'a.txt'), 'a');
    const subDir = join(tmpDir, 'nested');
    await ensureDir(subDir);
    await writeFile(join(subDir, 'deep.txt'), 'deep');

    await emptyDir(tmpDir);

    const entries = await readdir(tmpDir);
    expect(entries).toEqual([]);
    expect(existsSync(tmpDir)).toBe(true);
  });

  it('should create the directory when it does not exist', async () => {
    const newDir = join(tmpDir, 'new-dir');

    await emptyDir(newDir);

    expect(existsSync(newDir)).toBe(true);
    const entries = await readdir(newDir);
    expect(entries).toEqual([]);
  });

  it('should rethrow non-ENOENT errors', async () => {
    const filePath = join(tmpDir, 'not-a-dir.txt');
    await writeFile(filePath, 'file');

    await expect(emptyDir(filePath)).rejects.toMatchObject({
      code: 'ENOTDIR',
    });
  });
});

describe('copy', () => {
  it('should copy a file without removing the source', async () => {
    const src = join(tmpDir, 'source.txt');
    const dest = join(tmpDir, 'dest.txt');
    await writeFile(src, 'content');

    await copy(src, dest);

    expect(await readFile(dest, 'utf-8')).toBe('content');
    expect(await readFile(src, 'utf-8')).toBe('content');
  });

  it('should recursively copy a directory', async () => {
    const srcDir = join(tmpDir, 'src-dir');
    await ensureDir(srcDir);
    await writeFile(join(srcDir, 'inner.txt'), 'inner');

    const destDir = join(tmpDir, 'dest-dir');
    await copy(srcDir, destDir);

    expect(await readFile(join(destDir, 'inner.txt'), 'utf-8')).toBe('inner');
  });
});

describe('move', () => {
  it('should move a file to a new location', async () => {
    const src = join(tmpDir, 'to-move.txt');
    const dest = join(tmpDir, 'moved.txt');
    await writeFile(src, 'data');

    await move(src, dest);

    expect(existsSync(src)).toBe(false);
    expect(await readFile(dest, 'utf-8')).toBe('data');
  });

  it('should rethrow non-EXDEV errors', async () => {
    const src = join(tmpDir, 'does-not-exist.txt');
    const dest = join(tmpDir, 'dest.txt');

    await expect(move(src, dest)).rejects.toThrow();
  });
});

describe('remove', () => {
  it('should delete a file', async () => {
    const filePath = join(tmpDir, 'to-delete.txt');
    await writeFile(filePath, 'bye');

    await remove(filePath);

    expect(existsSync(filePath)).toBe(false);
  });

  it('should recursively delete a directory', async () => {
    const dirPath = join(tmpDir, 'to-delete-dir');
    await ensureDir(dirPath);
    await writeFile(join(dirPath, 'child.txt'), 'child');

    await remove(dirPath);

    expect(existsSync(dirPath)).toBe(false);
  });

  it('should not throw when the path does not exist', async () => {
    await expect(remove(join(tmpDir, 'already-gone'))).resolves.not.toThrow();
  });
});

describe('readJson', () => {
  it('should parse a JSON file and return typed data', async () => {
    const filePath = join(tmpDir, 'data.json');
    await writeFile(filePath, JSON.stringify({ key: 'value', count: 42 }));

    const result = await readJson<{ key: string; count: number }>(filePath);

    expect(result).toEqual({ key: 'value', count: 42 });
  });

  it('should throw on invalid JSON', async () => {
    const filePath = join(tmpDir, 'bad.json');
    await writeFile(filePath, '{ broken }');

    await expect(readJson(filePath)).rejects.toThrow();
  });

  it('should throw when the file does not exist', async () => {
    await expect(readJson(join(tmpDir, 'nope.json'))).rejects.toThrow();
  });
});

describe('writeJson', () => {
  it('should write pretty-printed JSON with a trailing newline', async () => {
    const filePath = join(tmpDir, 'out.json');

    await writeJson(filePath, { hello: 'world' });

    const raw = await readFile(filePath, 'utf-8');
    expect(raw).toBe('{\n  "hello": "world"\n}\n');
  });

  it('should produce valid JSON that readJson can parse', async () => {
    const filePath = join(tmpDir, 'roundtrip.json');
    const data = { nested: { array: [1, 2, 3] } };

    await writeJson(filePath, data);
    const result = await readJson(filePath);

    expect(result).toEqual(data);
  });
});
