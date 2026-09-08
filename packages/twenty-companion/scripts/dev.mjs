import { spawn } from 'node:child_process';
import { createServer } from 'vite';
import { build } from 'esbuild';
import electron from 'electron';

await build({
  entryPoints: { main: 'src/main/main.ts', preload: 'src/main/preload.ts' },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outdir: 'dist',
  outExtension: { '.js': '.cjs' },
  external: ['electron', '@recallai/desktop-sdk'],
});
const server = await createServer();
await server.listen();
const child = spawn(electron, ['.'], {
  stdio: 'inherit',
  env: { ...process.env, TWENTY_COMPANION_DEV_URL: 'http://127.0.0.1:4317' },
});
child.on('exit', async (code) => {
  await server.close();
  process.exit(code ?? 0);
});
process.on('SIGINT', () => child.kill('SIGTERM'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
