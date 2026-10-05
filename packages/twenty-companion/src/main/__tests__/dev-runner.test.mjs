import { EventEmitter } from 'node:events';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  spawn: vi.fn(),
  context: vi.fn(),
  server: { listen: vi.fn(), close: vi.fn() },
  watcher: { watch: vi.fn(), dispose: vi.fn() },
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));
vi.mock('node:child_process', () => ({ spawn: mocks.spawn }));
vi.mock('node:fs/promises', () => ({
  mkdir: mocks.mkdir,
  writeFile: mocks.writeFile,
}));
vi.mock('vite', () => ({ createServer: async () => mocks.server }));
vi.mock('esbuild', () => ({ context: mocks.context }));
vi.mock('electron', () => ({ default: '/electron' }));

let onStart;
let onEnd;
let children;
let previousSignals;
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  previousSignals = new Map(
    ['SIGINT', 'SIGTERM'].map((signal) => [signal, process.listeners(signal)]),
  );
  vi.spyOn(process, 'exit').mockImplementation(() => undefined);
  children = [];
  mocks.spawn.mockImplementation(() => {
    const child = new EventEmitter();
    child.connected = true;
    child.send = vi.fn();
    child.kill = vi.fn();
    children.push(child);
    return child;
  });
  mocks.context.mockImplementation(async (options) => {
    options.plugins[0].setup({
      onStart: (callback) => {
        onStart = callback;
      },
      onEnd: (callback) => {
        onEnd = callback;
      },
    });
    return mocks.watcher;
  });
  await import('../../../scripts/dev.mjs');
});
afterEach(async () => {
  for (const [signal, previous] of previousSignals) {
    for (const listener of process.listeners(signal)) {
      if (!previous.includes(listener)) {
        if (signal === 'SIGTERM') listener();
        process.removeListener(signal, listener);
      }
    }
  }
  await vi.waitFor(() => expect(mocks.server.close).toHaveBeenCalled());
  vi.restoreAllMocks();
});
const successfulBuild = async () => {
  onStart();
  await onEnd({
    errors: [],
    outputFiles: [{ path: '/dist/main.cjs', contents: new Uint8Array([1]) }],
  });
};

it('starts Electron only after a successful build and keeps it alive after errors', async () => {
  onStart();
  await onEnd({ errors: ['syntax error'] });
  expect(mocks.spawn).not.toHaveBeenCalled();
  expect(mocks.writeFile).not.toHaveBeenCalled();
  await successfulBuild();
  expect(mocks.spawn).toHaveBeenCalledOnce();
  onStart();
  await onEnd({ errors: ['syntax error'] });
  expect(children[0].send).not.toHaveBeenCalled();
  expect(children[0].kill).not.toHaveBeenCalled();
});

it('requests restarts without killing the child, then waits for its acknowledged exit', async () => {
  await successfulBuild();
  await successfulBuild();
  await successfulBuild();
  expect(children[0].send).toHaveBeenCalledWith(
    { type: 'development-restart' },
    expect.any(Function),
  );
  expect(children[0].kill).not.toHaveBeenCalled();
  expect(mocks.spawn).toHaveBeenCalledOnce();
  children[0].emit('message', { type: 'development-restarting' });
  children[0].emit('exit', 0);
  expect(mocks.spawn).toHaveBeenCalledTimes(2);
});

it('waits for an ongoing build before relaunching an exiting child', async () => {
  await successfulBuild();
  await successfulBuild();
  onStart();
  children[0].emit('message', { type: 'development-restarting' });
  children[0].emit('exit', 0);
  expect(mocks.spawn).toHaveBeenCalledOnce();
  await onEnd({ errors: [], outputFiles: [] });
  expect(mocks.spawn).toHaveBeenCalledTimes(2);
});

it('closes Vite and the watcher when Electron quits normally', async () => {
  await successfulBuild();
  children[0].emit('exit', 0);
  await vi.waitFor(() => expect(mocks.server.close).toHaveBeenCalled());
  expect(mocks.watcher.dispose).toHaveBeenCalledOnce();
  expect(mocks.spawn).toHaveBeenCalledOnce();
});
