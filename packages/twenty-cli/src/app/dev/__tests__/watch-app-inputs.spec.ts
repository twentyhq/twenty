import { readdirSync } from 'node:fs';
import type * as nodeFileSystem from 'node:fs';
import {
  mkdir,
  mkdtemp,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import type * as nodeOperatingSystem from 'node:os';
import { dirname, join, parse } from 'node:path';

import { isNonEmptyString } from '@sniptt/guards';
import type * as chokidar from 'chokidar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  collectWatchInputs,
  recordWatchFile,
} from '@/app/dev/collect-watch-inputs';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
import { watchAppInputs } from '@/app/dev/watch-app-inputs';

const watcherOptions = vi.hoisted(() => ({
  useFsEvents: false,
  homeDirectory: '',
}));

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof nodeFileSystem>();
  return { ...actual, readdirSync: vi.fn(actual.readdirSync) };
});

vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof nodeOperatingSystem>();
  return {
    ...actual,
    homedir: () =>
      isNonEmptyString(watcherOptions.homeDirectory)
        ? watcherOptions.homeDirectory
        : actual.homedir(),
  };
});

vi.mock('chokidar', async (importOriginal) => {
  const actual = await importOriginal<typeof chokidar>();

  return {
    ...actual,
    watch: (...[paths, options]: Parameters<typeof actual.watch>) =>
      actual.watch(paths, {
        ...options,
        useFsEvents: watcherOptions.useFsEvents,
      }),
  };
});

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
});
const fixture = async () => {
  const root = await mkdtemp(join(tmpdir(), 'twenty-watch-'));
  cleanups.push(() => rm(root, { recursive: true, force: true }));
  const appPath = join(root, 'app');
  await mkdir(appPath);
  const onChange = vi.fn();
  const onError = vi.fn();
  const onWarning = vi.fn();
  const onScopeChange = vi.fn(async () => {});
  const watcher = await watchAppInputs({
    appPath,
    signal: new AbortController().signal,
    onChange,
    onError,
    onWarning,
    onScopeChange,
  });
  cleanups.push(watcher.close);
  await new Promise((resolve) => setTimeout(resolve, 400));
  onChange.mockClear();

  return {
    root,
    appPath,
    watcher,
    onChange,
    onError,
    onWarning,
    onScopeChange,
  };
};
const waitForChange = ({
  onChange,
  message,
}: {
  onChange: () => void;
  message?: string;
}) =>
  vi.waitFor(() => expect(onChange, message).toHaveBeenCalled(), {
    timeout: 3000,
  });

const collect = async (file: string) =>
  (
    await collectWatchInputs(async () => {
      recordWatchFile(file);
    })
  ).watchInputs;

describe.each(['platform', 'node'])('app input watch (%s)', (backend) => {
  beforeEach(() => {
    watcherOptions.useFsEvents = backend === 'platform';
    watcherOptions.homeDirectory = '';
    vi.mocked(readdirSync).mockClear();
  });
  it('observes atomic saves and new files, ignores generated output and dependency installations', async () => {
    const { appPath, onChange, onError } = await fixture();
    const source = join(appPath, 'source.ts');
    await writeFile(source, 'first');
    await waitForChange({ onChange });
    onChange.mockClear();
    await writeFile(join(appPath, 'source.tmp'), 'second');
    await rename(join(appPath, 'source.tmp'), source);
    await waitForChange({ onChange });
    onChange.mockClear();
    for (const ignored of ['.twenty', '.git', 'node_modules']) {
      await mkdir(join(appPath, ignored));
      await writeFile(join(appPath, ignored, 'output.ts'), 'ignored');
    }
    await writeFile(join(appPath, '.source.ts.swo'), 'editor swap');
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(onChange).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('keeps successful external inputs on failure, handles missing siblings, then drops obsolete inputs', async () => {
    const { root, watcher, onChange } = await fixture();
    const external = join(root, 'linked', 'external.ts');
    await mkdir(join(root, 'linked'));
    await writeFile(external, 'initial');
    await watcher.update(await collect(external), true);
    await writeFile(external, 'syntax error');
    await waitForChange({ onChange, message: 'initial external edit' });
    await watcher.update([], false);
    onChange.mockClear();
    await writeFile(external, 'fixed');
    await waitForChange({
      onChange,
      message: 'external edit after a failed build',
    });
    const missing = join(root, 'linked', 'new-folder', 'missing.ts');
    await watcher.update(await collect(missing), false);
    onChange.mockClear();
    await mkdir(join(root, 'linked', 'new-folder'));
    await writeFile(missing, 'created');
    await waitForChange({ onChange, message: 'missing sibling creation' });
    await watcher.update([], true);
    onChange.mockClear();
    await writeFile(external, 'unrelated now');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('observes recreation of a previously successful external input directory', async () => {
    const { root, watcher, onChange } = await fixture();
    const directory = join(root, 'linked', 'nested');
    const external = join(directory, 'external.ts');

    await mkdir(directory, { recursive: true });
    await writeFile(external, 'initial');
    await watcher.update(await collect(external), true);
    await rm(directory, { recursive: true });
    await watcher.update(await collect(external), false);
    onChange.mockClear();

    await mkdir(directory);
    await writeFile(external, 'restored');

    await waitForChange({ onChange });
  });

  it('keeps a shallow watch when the tracked directory and its parent disappear', async () => {
    const { root, watcher, onChange, onError } = await fixture();
    const parent = join(root, 'linked');
    const directory = join(parent, 'nested');
    await mkdir(directory, { recursive: true });
    const path = await realpath(directory);
    const inputs = [
      {
        path,
        kind: 'directory' as const,
        stamp: readWatchInputStamp({ path, kind: 'directory' }),
      },
    ];
    await watcher.update(inputs, true);
    await rm(parent, { recursive: true });
    await watcher.update([], false);
    await vi.waitFor(
      async () => {
        onChange.mockClear();
        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(onChange).not.toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
    await mkdir(join(root, 'unrelated'));
    await writeFile(join(root, 'unrelated', 'ignored.ts'), 'ignored');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(onChange).not.toHaveBeenCalled();
    await mkdir(parent);
    await mkdir(directory);
    await waitForChange({ onChange });
    expect(onError).not.toHaveBeenCalled();
  });

  it('observes removal of an external directory even with no file inputs', async () => {
    const { root, watcher, onChange } = await fixture();
    const directory = join(root, 'empty-linked');
    await mkdir(directory);
    const path = await realpath(directory);
    await watcher.update(
      [
        {
          path,
          kind: 'directory',
          stamp: readWatchInputStamp({ path, kind: 'directory' }),
        },
      ],
      false,
    );
    await vi.waitFor(
      async () => {
        onChange.mockClear();
        await new Promise((resolve) => setTimeout(resolve, 200));
        expect(onChange).not.toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
    onChange.mockClear();
    await writeFile(join(root, 'unrelated.ts'), 'outside the tracked inputs');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(onChange).not.toHaveBeenCalled();
    await rm(directory, { recursive: true });
    await waitForChange({ onChange });
  });

  it('detects a file replaced by a directory before watcher registration', async () => {
    const { root, watcher, onChange } = await fixture();
    const directory = join(root, 'external');
    await mkdir(directory);
    await writeFile(join(directory, 'entry'), 'file');
    const path = await realpath(directory);
    const stamp = readWatchInputStamp({ path, kind: 'directory' });
    await rm(join(directory, 'entry'));
    await mkdir(join(directory, 'entry'));
    await watcher.update([{ path, kind: 'directory', stamp }], false);
    expect(onChange).toHaveBeenCalled();
  });

  it('detects an external edit in the gap between compilation and watcher registration', async () => {
    const { root, watcher, onChange } = await fixture();
    const external = join(root, 'external.ts');
    await writeFile(external, 'before');
    const inputs = await collect(external);
    await writeFile(external, 'after');
    await watcher.update(inputs, true);
    expect(onChange).toHaveBeenCalled();
  });

  it('reports changed scope, retaining successful inputs on failure and dropping obsolete paths on success', async () => {
    const { root, watcher, onScopeChange } = await fixture();
    const home = join(root, 'home');
    await mkdir(home);
    watcherOptions.homeDirectory = await realpath(home);
    const external = join(home, 'helper.ts');
    await writeFile(external, 'initial');
    const inputs = await collect(external);
    await watcher.update(inputs, true);
    await watcher.update([...inputs].reverse(), false);
    expect(onScopeChange).toHaveBeenCalledOnce();
    expect(onScopeChange).toHaveBeenLastCalledWith({
      filePaths: [await realpath(external)],
      directoryPaths: [],
      excludedDirectoryPaths: [await realpath(home)],
    });

    const missing = join(home, 'missing.ts');
    await watcher.update(await collect(missing), false);
    expect(onScopeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filePaths: [await realpath(external), missing].sort(),
      }),
    );
    await watcher.update([], true);
    expect(onScopeChange).toHaveBeenCalledTimes(3);
    expect(onScopeChange).toHaveBeenLastCalledWith({
      filePaths: [],
      directoryPaths: [],
      excludedDirectoryPaths: [],
    });
  });

  it('never lists broad directories or their symlink aliases while collecting or attaching inputs', async () => {
    const { root, watcher, onWarning } = await fixture();
    const home = join(root, 'home');
    await mkdir(home);
    watcherOptions.homeDirectory = await realpath(home);
    const alias = join(root, 'home-alias');
    await symlink(home, alias);

    for (const directory of [
      home,
      alias,
      dirname(home),
      tmpdir(),
      parse(root).root,
    ]) {
      const inputs = await collect(join(directory, 'not-created.ts'));
      expect(inputs).toContainEqual({
        path: await realpath(directory),
        kind: 'directory',
        stamp: null,
      });
      const stamp = readWatchInputStamp({ path: directory, kind: 'directory' });
      expect(stamp).toBeNull();
      await watcher.update(
        [...inputs, { path: directory, kind: 'directory', stamp }],
        false,
      );
    }

    expect(onWarning).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'WATCH_SCOPE_LIMITED' }),
    );
    expect(readdirSync).not.toHaveBeenCalled();
  });

  it('watches exact files in an excluded directory through atomic saves, deletion and creation', async () => {
    const { root, watcher, onChange, onWarning } = await fixture();
    const home = join(root, 'home');
    await mkdir(home);
    watcherOptions.homeDirectory = await realpath(home);
    const external = join(home, 'helper.ts');
    await writeFile(external, 'initial');
    await watcher.update(await collect(external), true);
    await watcher.update(await collect(external), true);
    expect(onWarning).toHaveBeenCalledOnce();
    await new Promise((resolve) => setTimeout(resolve, 400));
    onChange.mockClear();

    await writeFile(join(home, 'unrelated.ts'), 'unrelated');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(onChange).not.toHaveBeenCalled();

    await writeFile(join(home, 'helper.tmp'), 'replacement');
    await rename(join(home, 'helper.tmp'), external);
    await waitForChange({ onChange });
    onChange.mockClear();
    await rm(external);
    await waitForChange({ onChange });
    onChange.mockClear();
    await writeFile(external, 'recreated');
    await waitForChange({ onChange });

    const missing = join(home, 'missing', 'new.ts');
    await watcher.update(await collect(missing), false);
    onChange.mockClear();
    await mkdir(dirname(missing));
    await writeFile(missing, 'created');
    await waitForChange({ onChange });
    expect(readdirSync).not.toHaveBeenCalled();

    await watcher.close();
    onChange.mockClear();
    await writeFile(external, 'after close');
    await new Promise((resolve) => setTimeout(resolve, 1200));
    expect(onChange).not.toHaveBeenCalled();
  }, 15000);
});
