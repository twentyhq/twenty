import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createServer } from 'vite';
import { context } from 'esbuild';
import electron from 'electron';
import { electronBuildOptions } from './electron-build.mjs';

const server = await createServer();
let watcher;
let child;
let stopping = false;
let building = false;
let launchPending = false;

const stop = async (code = 0) => {
  if (stopping) return;
  stopping = true;
  child?.kill('SIGTERM');
  await watcher?.dispose();
  await server.close();
  process.exit(code);
};

const launch = () => {
  if (building) {
    launchPending = true;
    return;
  }
  launchPending = false;
  let restarting = false;
  child = spawn(electron, ['.'], {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    env: { ...process.env, TWENTY_COMPANION_DEV_URL: 'http://127.0.0.1:4317' },
  });
  child.on('message', (message) => {
    if (message?.type === 'development-restarting') restarting = true;
  });
  child.on('error', (error) => {
    console.error('Could not launch Electron.', error);
    void stop(1);
  });
  child.on('exit', (code) => {
    child = undefined;
    if (stopping) return;
    if (restarting && code === 0) launch();
    else void stop(code ?? 1);
  });
};

try {
  await server.listen();
  watcher = await context({
    ...electronBuildOptions,
    // A failed compilation must not replace either half of the working Electron build.
    write: false,
    plugins: [
      {
        name: 'restart-electron',
        setup(build) {
          build.onStart(() => {
            building = true;
          });
          build.onEnd(async (result) => {
            try {
              if (stopping || result.errors.length) return;
              for (const output of result.outputFiles) {
                await mkdir(dirname(output.path), { recursive: true });
                await writeFile(output.path, output.contents);
              }
              if (stopping) return;
              if (!child) launch();
              else if (child.connected) {
                console.log(
                  'Electron rebuilt; restart will wait for recording to finish.',
                );
                child.send({ type: 'development-restart' }, (error) => {
                  if (error && child?.connected)
                    console.error('Could not request restart.', error);
                });
              }
            } finally {
              building = false;
              if (!stopping && launchPending) launch();
            }
          });
        },
      },
    ],
  });
  await watcher.watch();
} catch (error) {
  console.error(error);
  await stop(1);
}
process.on('SIGINT', () => void stop());
process.on('SIGTERM', () => void stop());
