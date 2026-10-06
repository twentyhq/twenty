import {
  link,
  lstat,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import type * as fileSystemPromises from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { writeAppAddFile } from '@/app/add/write-app-add-file';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof fileSystemPromises>();

  return {
    ...actual,
    link: vi.fn(actual.link),
    lstat: vi.fn(actual.lstat),
    rm: vi.fn(actual.rm),
    writeFile: vi.fn(actual.writeFile),
  };
});

describe('app add exclusive file creation', () => {
  let root: string;
  const file = {
    path: 'src/objects/invoice.ts',
    content: 'complete definition',
  };
  const actual = vi.importActual<typeof fileSystemPromises>('node:fs/promises');

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'twenty-add-write-'));
  });
  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it.each(['EACCES', 'EIO'])(
    'preserves %s from path validation',
    async (code) => {
      const error = Object.assign(new Error('filesystem failure'), { code });
      vi.mocked(lstat).mockRejectedValueOnce(error);
      await expect(
        writeAppAddFile({
          appPath: root,
          file,
          signal: new AbortController().signal,
        }),
      ).rejects.toBe(error);
      expect(link).not.toHaveBeenCalled();
    },
  );

  it('preserves a destination created while the new definition was staged', async () => {
    vi.mocked(link).mockImplementationOnce(async (source, destination) => {
      await (await actual).writeFile(destination, 'concurrent user definition');

      return (await actual).link(source, destination);
    });

    await expect(
      writeAppAddFile({
        appPath: root,
        file,
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({ code: 'APP_PATH_UNAVAILABLE', exitCode: 6 });
    expect(await readFile(join(root, file.path), 'utf8')).toBe(
      'concurrent user definition',
    );
    expect(await readdir(join(root, 'src/objects'))).toEqual(['invoice.ts']);
  });

  it('removes a partial staged write without exposing an incomplete definition', async () => {
    vi.mocked(writeFile).mockImplementationOnce(async (path) => {
      await (await actual).writeFile(path, 'partial');
      throw new Error('disk full');
    });

    await expect(
      writeAppAddFile({
        appPath: root,
        file,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow('disk full');
    expect(await readdir(join(root, 'src/objects'))).toEqual([]);
  });

  it('cancels after staging without creating the destination', async () => {
    const cancellation = new AbortController();

    vi.mocked(writeFile).mockImplementationOnce(async (...args) => {
      await (await actual).writeFile(...args);
      cancellation.abort();
    });

    await expect(
      writeAppAddFile({ appPath: root, file, signal: cancellation.signal }),
    ).rejects.toThrow();
    expect(await readdir(join(root, 'src/objects'))).toEqual([]);
  });

  it('reports completion when cancellation arrives after the file was committed', async () => {
    const cancellation = new AbortController();

    vi.mocked(link).mockImplementationOnce(async (...args) => {
      await (await actual).link(...args);
      cancellation.abort();
    });

    await expect(
      writeAppAddFile({ appPath: root, file, signal: cancellation.signal }),
    ).resolves.toBeUndefined();
    expect(await readFile(join(root, file.path), 'utf8')).toBe(file.content);
    expect(await readdir(join(root, 'src/objects'))).toEqual(['invoice.ts']);
  });

  it('returns a cleanup warning path after a successful commit instead of reporting failure', async () => {
    vi.mocked(rm).mockRejectedValueOnce(new Error('cleanup denied'));

    const cleanupPath = await writeAppAddFile({
      appPath: root,
      file,
      signal: new AbortController().signal,
    });

    expect(cleanupPath).toContain(join(root, 'src/objects/.twenty-add-'));
    expect(await readFile(join(root, file.path), 'utf8')).toBe(file.content);
  });
});
