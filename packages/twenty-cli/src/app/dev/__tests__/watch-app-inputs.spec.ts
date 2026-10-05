import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type * as chokidar from 'chokidar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  collectWatchInputs,
  recordWatchFile,
} from '@/app/dev/collect-watch-inputs';
import { watchAppInputs } from '@/app/dev/watch-app-inputs';

const watcherOptions = vi.hoisted(() => ({ useFsEvents: false }));

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
  const watcher = await watchAppInputs({
    appPath,
    signal: new AbortController().signal,
    onChange,
    onError,
  });
  cleanups.push(watcher.close);

  return { root, appPath, watcher, onChange, onError };
};
const collect = async (file: string) =>
  (
    await collectWatchInputs(async () => {
      recordWatchFile(file);
    })
  ).watchInputs;

describe.each(['platform', 'node'])('app input watch (%s)', (backend) => {
  beforeEach(() => {
    watcherOptions.useFsEvents = backend === 'platform';
  });
  it('observes atomic saves and new files, ignores generated output and dependency installations', async () => {
    const { appPath, onChange, onError } = await fixture();
    const source = join(appPath, 'source.ts');
    await writeFile(source, 'first');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    onChange.mockClear();
    await writeFile(join(appPath, 'source.tmp'), 'second');
    await rename(join(appPath, 'source.tmp'), source);
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    onChange.mockClear();
    for (const ignored of ['.twenty', '.git', 'node_modules']) {
      await mkdir(join(appPath, ignored));
      await writeFile(join(appPath, ignored, 'output.ts'), 'ignored');
    }
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
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    await watcher.update([], false);
    onChange.mockClear();
    await writeFile(external, 'fixed');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const missing = join(root, 'linked', 'new-folder', 'missing.ts');
    await watcher.update(await collect(missing), false);
    onChange.mockClear();
    await mkdir(join(root, 'linked', 'new-folder'));
    await writeFile(missing, 'created');
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    await watcher.update([], true);
    onChange.mockClear();
    await writeFile(external, 'unrelated now');
    await new Promise((resolve) => setTimeout(resolve, 150));
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

    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
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
});
