// The generated client ships its own copy of the genql runtime. We import the
// files as raw text (Vite's `?raw`) so they are bundled into this package and
// copied verbatim into each generated client's `runtime/` folder (with a
// `// @ts-nocheck` header, as genql does).
//
// `?raw` only resolves under Vite. When this module runs outside a Vite bundle
// — e.g. `tsx scripts/generate-metadata-client.ts`, which backs the
// `generate-metadata-client` target and server-validation — the `?raw` imports
// are `undefined`, so we fall back to reading the sibling source files from
// disk. In the bundled build the imports are defined and the fallback is never
// reached, so the shipped runtime is unchanged.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import batcher from './runtime/batcher.ts?raw';
import createClient from './runtime/createClient.ts?raw';
import error from './runtime/error.ts?raw';
import fetcher from './runtime/fetcher.ts?raw';
import generateGraphqlOperation from './runtime/generateGraphqlOperation.ts?raw';
import index from './runtime/index.ts?raw';
import linkTypeMap from './runtime/linkTypeMap.ts?raw';
import typeSelection from './runtime/typeSelection.ts?raw';
import types from './runtime/types.ts?raw';

const readTemplate = (
  bundled: string | undefined,
  fileName: string,
): string => {
  if (bundled !== undefined) return bundled;

  const runtimeDir = join(dirname(fileURLToPath(import.meta.url)), 'runtime');

  return readFileSync(join(runtimeDir, fileName), 'utf-8');
};

export const RUNTIME_TEMPLATE_FILES: { name: string; content: string }[] = [
  { name: 'batcher.ts', content: readTemplate(batcher, 'batcher.ts') },
  {
    name: 'createClient.ts',
    content: readTemplate(createClient, 'createClient.ts'),
  },
  { name: 'error.ts', content: readTemplate(error, 'error.ts') },
  { name: 'fetcher.ts', content: readTemplate(fetcher, 'fetcher.ts') },
  {
    name: 'generateGraphqlOperation.ts',
    content: readTemplate(
      generateGraphqlOperation,
      'generateGraphqlOperation.ts',
    ),
  },
  { name: 'index.ts', content: readTemplate(index, 'index.ts') },
  {
    name: 'linkTypeMap.ts',
    content: readTemplate(linkTypeMap, 'linkTypeMap.ts'),
  },
  {
    name: 'typeSelection.ts',
    content: readTemplate(typeSelection, 'typeSelection.ts'),
  },
  { name: 'types.ts', content: readTemplate(types, 'types.ts') },
];
