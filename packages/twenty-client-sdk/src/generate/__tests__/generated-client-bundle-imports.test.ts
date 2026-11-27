import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateCoreClientFromSchema } from '../generate-core-client';
import { generate } from '../genql';

type GenqlModule = { generate: typeof generate };

vi.mock('../genql', async (importOriginal) => {
  const original = await importOriginal<GenqlModule>();

  return { ...original, generate: vi.fn(original.generate) };
});

const SCHEMA = 'type Query { hello: String }';

type CanaryContext = {
  canaryPath: string;
  outputPath: string;
  marker: string;
};

type OutsideImportTestCase = {
  title: string;
  source: (context: CanaryContext) => string;
  addFilesOutside?: (context: CanaryContext) => Promise<void>;
  addFilesToGeneratedDirectory?: (
    context: CanaryContext & { generatedDirectory: string },
  ) => Promise<void>;
};

const quote = (value: string) => JSON.stringify(value);

const relativeImportPath = ({ outputPath, canaryPath }: CanaryContext) =>
  `./${relative(outputPath, canaryPath)}`;

const relativeOutsideDirectory = (context: CanaryContext) =>
  relativeImportPath(context).replace(/\/canary$/, '');

// The source is appended to the generated index.ts as if the schema text had
// already escaped its comment, so only the bundle step stands in the way.
const OUTSIDE_IMPORT_TEST_CASES: OutsideImportTestCase[] = [
  {
    title: 'a text import of an absolute path',
    source: ({ canaryPath }) =>
      `void import(${quote(canaryPath)}, { with: { type: 'text' } });`,
  },
  {
    title: 'a static text import',
    source: ({ canaryPath }) =>
      `import canary from ${quote(canaryPath)} with { type: 'text' };\nexport { canary };`,
  },
  {
    title: 'a bytes import',
    source: ({ canaryPath }) =>
      `void import(${quote(canaryPath)}, { with: { type: 'bytes' } });`,
  },
  {
    title: 'a json import',
    source: ({ canaryPath }) =>
      `void import(${quote(canaryPath)}, { with: { type: 'json' } });`,
  },
  {
    title: 'a require call',
    source: ({ canaryPath }) =>
      `export const canary = require(${quote(canaryPath)});`,
  },
  {
    title: 'a relative path leaving the directory',
    source: (context) =>
      `void import(${quote(relativeImportPath(context))}, { with: { type: 'text' } });`,
  },
  {
    title: 'a template literal import',
    source: (context) =>
      `const name = 'canary';\nvoid import(\`${relativeOutsideDirectory(context)}/\${name}\`, { with: { type: 'text' } });`,
  },
  {
    title: 'a template literal import matching several files',
    source: (context) =>
      `const name = 'canary';\nvoid import(\`${relativeOutsideDirectory(context)}/\${name}\`, { with: { type: 'text' } });`,
    addFilesOutside: async ({ canaryPath, marker }) => {
      await writeFile(`${canaryPath}-${marker}-first`, 'first');
      await writeFile(`${canaryPath}-${marker}-second`, 'second');
    },
  },
  {
    title: 'a directory holding a malformed package.json',
    source: (context) =>
      `void import(${quote(`${relativeOutsideDirectory(context)}/package-directory`)});`,
    addFilesOutside: async ({ canaryPath, marker }) => {
      const packageDirectory = join(canaryPath, '..', 'package-directory');

      await mkdir(packageDirectory);
      await writeFile(join(packageDirectory, 'package.json'), `{ ${marker} }`);
    },
  },
  {
    title: 'a relative path to a missing file',
    source: (context) =>
      `void import(${quote(`${relativeOutsideDirectory(context)}/missing`)}, { with: { type: 'text' } });`,
  },
  {
    title: 'a file: URL',
    source: ({ canaryPath }) =>
      `void import(${quote(pathToFileURL(canaryPath).href)}, { with: { type: 'text' } });`,
  },
  {
    title: 'a data: URL re-exporting a path',
    source: ({ canaryPath }) =>
      `void import(${quote(`data:text/javascript,export { default } from ${quote(canaryPath)} with { type: "text" }`)});`,
  },
  {
    title: 'a symlink pointing outside',
    source: () => `void import('./canary-link', { with: { type: 'text' } });`,
    addFilesToGeneratedDirectory: ({ canaryPath, generatedDirectory }) =>
      symlink(canaryPath, join(generatedDirectory, 'canary-link')),
  },
  {
    title: 'a Node.js built-in module',
    source: () =>
      `import { readFileSync } from 'node:fs';\nexport const read = readFileSync;`,
  },
];

const readFilesRecursively = async (directory: string): Promise<string[]> => {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });

  return Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => readFile(join(entry.parentPath, entry.name), 'utf-8')),
  );
};

describe('Generated client bundle stays inside the generated directory', () => {
  let workDirectory: string;
  let canaryPath: string;
  let marker: string;
  let outputPath: string;

  beforeEach(async () => {
    workDirectory = await mkdtemp(
      join(tmpdir(), 'twenty-generated-client-imports-'),
    );
    await mkdir(join(workDirectory, 'outside'));

    marker = `CANARY_${randomUUID().replace(/-/g, '')}`;
    canaryPath = join(workDirectory, 'outside', 'canary');
    outputPath = join(workDirectory, 'client');

    await writeFile(canaryPath, marker);
  });

  afterEach(async () => {
    vi.mocked(generate).mockClear();
    await rm(workDirectory, { recursive: true, force: true });
  });

  it.each(OUTSIDE_IMPORT_TEST_CASES)(
    'refuses $title',
    async ({ source, addFilesOutside, addFilesToGeneratedDirectory }) => {
      const context = { canaryPath, outputPath, marker };

      await addFilesOutside?.(context);

      if (addFilesToGeneratedDirectory) {
        const { generate: realGenerate } =
          await vi.importActual<GenqlModule>('../genql');

        vi.mocked(generate).mockImplementationOnce(async (config) => {
          await realGenerate(config);
          await addFilesToGeneratedDirectory({
            ...context,
            generatedDirectory: config.output ?? '',
          });
        });
      }

      const generation = generateCoreClientFromSchema({
        schema: SCHEMA,
        outputPath,
        clientWrapperTemplateSource: source(context),
      });

      const error = await generation.then(
        () => undefined,
        (rejection: unknown) => rejection,
      );

      expect(error).toBeInstanceOf(Error);

      const { message } = error as Error;

      expect(message).not.toContain(marker);
      expect(message).toMatch(/^Build failed with 1 error:/);
      expect(message).toContain(
        'The generated client may only import files from its own directory',
      );

      const outputFileNames = await readdir(outputPath).catch(() => []);

      expect(outputFileNames).not.toContain('index.mjs');
      expect(outputFileNames).not.toContain('index.cjs');

      const outputContents = (await readFilesRecursively(outputPath)).join(
        '\n',
      );

      expect(outputContents).not.toContain(marker);
      expect(outputContents).not.toContain(
        Buffer.from(marker).toString('base64'),
      );
    },
  );

  it('builds a client whose output directory is reached through a symlink', async () => {
    const realDirectory = join(workDirectory, 'real');
    const linkedDirectory = join(workDirectory, 'linked');

    await mkdir(realDirectory);
    await symlink(realDirectory, linkedDirectory);

    const linkedOutputPath = join(linkedDirectory, 'client');

    await generateCoreClientFromSchema({
      schema: SCHEMA,
      outputPath: linkedOutputPath,
    });

    const generatedModule = await import(
      `${pathToFileURL(join(linkedOutputPath, 'index.mjs')).href}?t=${Date.now()}`
    );

    expect(typeof generatedModule.CoreApiClient).toBe('function');
    expect(typeof generatedModule.createClient).toBe('function');
  });
});
