import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

if (process.platform !== 'darwin' || process.arch !== 'arm64')
  throw new Error('Desktop launch and packaging require an Apple Silicon Mac.');

const require = createRequire(import.meta.url);
for (const [name, artifact, installer] of [
  ['electron', 'dist/Electron.app/Contents/MacOS/Electron', 'install.js'],
  ['@recallai/desktop-sdk', 'desktop_sdk_macos_exe', 'setup.js'],
]) {
  const directory = dirname(require.resolve(`${name}/package.json`));
  const artifactPath = join(directory, artifact);
  try {
    await access(artifactPath);
    continue;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  execFileSync(process.execPath, [join(directory, installer)], {
    cwd: directory,
    stdio: 'inherit',
  });
  await access(artifactPath);
}
