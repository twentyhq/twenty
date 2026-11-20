import {
  mkdirSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
  watch,
  writeFileSync,
} from 'node:fs';
import type * as nodeFileSystem from 'node:fs';
import {
  mkdir,
  mkdtemp,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { clearInterval, setInterval } from 'node:timers';
import type * as nodeTimers from 'node:timers';

import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { watchExternalInput } from '@/app/dev/watch-external-input';

vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof nodeFileSystem>();
  return {
    ...actual,
    watch: vi.fn(actual.watch),
    realpathSync: vi.fn(actual.realpathSync),
    readdirSync: vi.fn(actual.readdirSync),
  };
});

vi.mock('node:timers', async (importOriginal) => {
  const actual = await importOriginal<typeof nodeTimers>();
  return {
    ...actual,
    setInterval: vi.fn(actual.setInterval),
    clearInterval: vi.fn(actual.clearInterval),
  };
});

const cleanups: (() => void | Promise<void>)[] = [];
let root: string;

beforeEach(async () => {
  vi.resetAllMocks();
  root = await realpath(await mkdtemp(join(tmpdir(), 'twenty-native-watch-')));
  cleanups.push(() => rm(root, { recursive: true, force: true }));
});

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) {
    await cleanup();
  }
});

const observe = ({
  path,
  kind = 'file',
}: {
  path: string;
  kind?: 'file' | 'directory';
}) => {
  const onChange = vi.fn();
  const onError = vi.fn();
  const close = watchExternalInput({
    input: { path, kind },
    onChange,
    onError,
  });
  cleanups.push(close);
  return { close, onChange, onError };
};

const waitForChange = (onChange: () => void) =>
  vi.waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 3000 });

it('detects replacement before native event registration settles', async () => {
  const file = join(root, 'helper.ts');
  writeFileSync(file, 'initial');
  const { onChange, onError } = observe({ path: file });
  writeFileSync(`${file}.tmp`, 'replacement');
  renameSync(`${file}.tmp`, file);

  await waitForChange(onChange);
  onChange.mockClear();
  await writeFile(file, 'edited after replacement');
  await waitForChange(onChange);
  expect(setInterval).not.toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
});

it('keeps watching file creation when a directory is replaced before native registration settles', async () => {
  const directory = join(root, 'linked');
  mkdirSync(directory);
  const { onChange, onError } = observe({ path: directory, kind: 'directory' });
  rmSync(directory, { recursive: true });
  mkdirSync(directory);
  writeFileSync(join(directory, 'new.ts'), 'created');

  await waitForChange(onChange);
  onChange.mockClear();
  await writeFile(join(directory, 'second.ts'), 'created later');
  await waitForChange(onChange);
  expect(setInterval).not.toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
});

it('uses native events without polling and keeps observing after repeated atomic saves', async () => {
  const file = join(root, 'helper.ts');
  await writeFile(file, 'initial');
  const { close, onChange, onError } = observe({ path: file });

  for (let revision = 0; revision < 3; revision++) {
    onChange.mockClear();
    await writeFile(`${file}.tmp`, `replacement ${revision}`);
    await rename(`${file}.tmp`, file);
    await waitForChange(onChange);
    onChange.mockClear();
    await writeFile(file, `edited ${revision}`);
    await waitForChange(onChange);
  }

  expect(setInterval).not.toHaveBeenCalled();
  expect(onError).not.toHaveBeenCalled();
  close();
  onChange.mockClear();
  await writeFile(file, 'after close');
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(onChange).not.toHaveBeenCalled();
});

it('polls a deleted file only until it can attach native events again', async () => {
  const file = join(root, 'helper.ts');
  await writeFile(file, 'initial');
  const { onChange, onError } = observe({ path: file });
  expect(setInterval).not.toHaveBeenCalled();

  await rm(file);
  await vi.waitFor(() => expect(setInterval).toHaveBeenCalledOnce());
  await waitForChange(onChange);
  onChange.mockClear();
  await writeFile(file, 'recreated');
  await waitForChange(onChange);
  await vi.waitFor(
    () =>
      expect(clearInterval).toHaveBeenCalledWith(
        vi.mocked(setInterval).mock.results[0].value,
      ),
    { timeout: 3000 },
  );

  onChange.mockClear();
  await writeFile(file, 'edited again');
  await waitForChange(onChange);
  expect(setInterval).toHaveBeenCalledOnce();
  expect(onError).not.toHaveBeenCalled();
});

it.each(['missing', 'file'])(
  'recovers an input whose parent is %s without watching ancestors',
  async (parentState) => {
    const parent = join(root, 'parent');
    const file = join(parent, 'helper.ts');
    if (parentState === 'file') {
      await writeFile(parent, 'not a directory yet');
    }
    const { onChange, onError } = observe({ path: file });
    expect(setInterval).toHaveBeenCalledOnce();

    await rm(parent, { force: true });
    await mkdir(parent);
    await writeFile(file, 'created');
    await waitForChange(onChange);
    expect(clearInterval).toHaveBeenCalledWith(
      vi.mocked(setInterval).mock.results[0].value,
    );
    expect(vi.mocked(watch).mock.calls.every(([path]) => path === file)).toBe(
      true,
    );
    expect(onError).not.toHaveBeenCalled();
  },
);

it('recovers from the native EPERM event for a deleted directory', async () => {
  const directory = join(root, 'linked');
  mkdirSync(directory);
  const { onChange, onError } = observe({ path: directory, kind: 'directory' });
  const nativeWatcher = vi.mocked(watch).mock.results[0].value;

  rmSync(directory, { recursive: true });
  nativeWatcher.emit(
    'error',
    Object.assign(new Error('deleted directory'), { code: 'EPERM' }),
  );
  expect(setInterval).toHaveBeenCalledOnce();
  onChange.mockClear();
  mkdirSync(directory);
  await waitForChange(onChange);
  expect(clearInterval).toHaveBeenCalledWith(
    vi.mocked(setInterval).mock.results[0].value,
  );
  expect(onError).not.toHaveBeenCalled();
});

it('reports native watcher resource failures instead of silently enabling polling', async () => {
  const file = join(root, 'helper.ts');
  await writeFile(file, 'initial');
  vi.mocked(watch).mockImplementationOnce(() => {
    throw Object.assign(new Error('watch limit reached'), { code: 'ENOSPC' });
  });

  const { onError } = observe({ path: file });
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'watch limit reached' }),
  );
  expect(setInterval).not.toHaveBeenCalled();
});

it('stops recovery checks when closed before the missing file appears', async () => {
  const file = join(root, 'missing.ts');
  const { close, onChange } = observe({ path: file });
  expect(setInterval).toHaveBeenCalledOnce();
  close();
  expect(clearInterval).toHaveBeenCalledWith(
    vi.mocked(setInterval).mock.results[0].value,
  );
  vi.mocked(watch).mockClear();

  await writeFile(file, 'created after close');
  await new Promise((resolve) => setTimeout(resolve, 1200));
  expect(onChange).not.toHaveBeenCalled();
  expect(watch).not.toHaveBeenCalled();
});

it.each(['EACCES', 'ELOOP'])(
  'reports %s resolving a directory without enumerating or watching it',
  async (code) => {
    const directory = join(root, 'linked');
    await mkdir(directory);
    const error = Object.assign(new Error('cannot resolve directory'), {
      code,
    });
    vi.mocked(realpathSync).mockImplementation(() => {
      throw error;
    });

    const { onError } = observe({ path: directory, kind: 'directory' });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'cannot resolve directory' }),
    );
    expect(watch).not.toHaveBeenCalled();
    expect(readdirSync).not.toHaveBeenCalled();
    expect(setInterval).not.toHaveBeenCalled();
  },
);

it('reports a canonical path error during native refresh and closes observation', async () => {
  const directory = join(root, 'linked');
  await mkdir(directory);
  const { onError } = observe({ path: directory, kind: 'directory' });
  const nativeWatcher = vi.mocked(watch).mock.results[0].value;
  const close = vi.spyOn(nativeWatcher, 'close');
  vi.mocked(realpathSync).mockImplementation(() => {
    throw Object.assign(new Error('cannot resolve directory'), {
      code: 'EACCES',
    });
  });
  vi.mocked(watch).mockClear();
  vi.mocked(readdirSync).mockClear();

  nativeWatcher.emit('change', 'rename', 'linked');

  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ message: 'cannot resolve directory' }),
  );
  expect(close).toHaveBeenCalled();
  expect(watch).not.toHaveBeenCalled();
  expect(readdirSync).not.toHaveBeenCalled();
  expect(setInterval).not.toHaveBeenCalled();
});
