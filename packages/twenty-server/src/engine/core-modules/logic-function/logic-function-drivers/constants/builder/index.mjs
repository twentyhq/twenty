import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { dirname, join, resolve } from 'path';

import { build } from 'esbuild';

const TEMPORARY_DIR = '/tmp';

const BANNER = {
  js: "import { createRequire as __createRequire } from 'module';\nconst require = __createRequire(import.meta.url);",
};

const emptyTemporaryDir = async () => {
  const entries = await fs.readdir(TEMPORARY_DIR);

  await Promise.all(
    entries.map((entry) =>
      fs.rm(join(TEMPORARY_DIR, entry), { recursive: true, force: true }),
    ),
  );
};

const refuseFilesOtherThan = (entryFilePath) => ({
  name: 'single-source-file',
  setup: ({ onLoad }) => {
    let hasRefusedFile = false;

    onLoad({ filter: /.*/, namespace: 'file' }, ({ path }) => {
      if (path === entryFilePath) {
        return undefined;
      }

      if (hasRefusedFile) {
        return { contents: '' };
      }

      hasRefusedFile = true;

      return {
        errors: [
          {
            text: 'Cannot import a file: a function is built from a single source file',
          },
        ],
      };
    });
  },
});

const assertPathInsideDir = (filePath, dir) => {
  const resolved = resolve(dir, filePath);

  if (!resolved.startsWith(dir + '/')) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }

  return resolved;
};

export const handler = async (event) => {
  const { action, targetRuntime, sourceCode, sourceFileName, builtFileName } =
    event;

  if (action !== 'transpile') {
    throw new Error(`Unknown action: ${action}`);
  }

  if (targetRuntime !== 'nodejs18.x' && targetRuntime !== 'nodejs22.x') {
    throw new Error(`Unsupported target runtime: ${targetRuntime}`);
  }

  if (!sourceCode || !sourceFileName || !builtFileName) {
    throw new Error(
      'Missing required fields: sourceCode, sourceFileName, builtFileName',
    );
  }

  await emptyTemporaryDir();

  const randomId = randomBytes(16).toString('hex');
  const workDir = join(TEMPORARY_DIR, randomId);

  await fs.mkdir(workDir, { recursive: true });

  try {
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
      target: 'esnext',
      bundle: true,
      sourcemap: false,
      tsconfigRaw: '{}',
      packages: 'external',
      banner: BANNER,
      plugins: [refuseFilesOtherThan(entryFilePath)],
    });

    const builtCode = await fs.readFile(outFilePath, 'utf-8');

    return { builtCode };
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
};
