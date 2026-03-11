import { promises as fs } from 'fs';
import { join, dirname, resolve } from 'path';

import { build } from 'esbuild';

const BANNER = {
  js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);",
};

const assertPathInsideDir = (filePath, dir) => {
  const resolved = resolve(dir, filePath);

  if (!resolved.startsWith(dir + '/')) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }

  return resolved;
};

export const handler = async (event) => {
  const { action, sourceCode, sourceFileName, builtFileName } = event;

  if (action !== 'transpile') {
    throw new Error(`Unknown action: ${action}`);
  }

  if (!sourceCode || !sourceFileName || !builtFileName) {
    throw new Error(
      'Missing required fields: sourceCode, sourceFileName, builtFileName',
    );
  }

  const workDir = '/tmp/transpile';

  await fs.rm(workDir, { recursive: true, force: true });
  await fs.mkdir(workDir, { recursive: true });

  const entryFilePath = assertPathInsideDir(sourceFileName, workDir);
  const outFilePath = assertPathInsideDir(builtFileName, workDir);

  await fs.mkdir(dirname(entryFilePath), { recursive: true });
  await fs.writeFile(entryFilePath, sourceCode, 'utf-8');
  await fs.mkdir(dirname(outFilePath), { recursive: true });

  await build({
    entryPoints: [entryFilePath],
    outfile: outFilePath,
    platform: 'node',
    format: 'esm',
    target: 'es2017',
    bundle: true,
    sourcemap: true,
    packages: 'external',
    banner: BANNER,
  });

  const builtCode = await fs.readFile(outFilePath, 'utf-8');

  await fs.rm(workDir, { recursive: true, force: true });

  return { builtCode };
};
