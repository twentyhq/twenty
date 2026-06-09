// The generated client ships its own copy of the genql runtime. Upstream genql
// reads these files from disk at generation time; we import them as raw text so
// they are bundled into this package and copied verbatim into each generated
// client's `runtime/` folder (with a `// @ts-nocheck` header, as genql does).
import batcher from './runtime/batcher.ts?raw';
import createClient from './runtime/createClient.ts?raw';
import error from './runtime/error.ts?raw';
import fetcher from './runtime/fetcher.ts?raw';
import generateGraphqlOperation from './runtime/generateGraphqlOperation.ts?raw';
import index from './runtime/index.ts?raw';
import linkTypeMap from './runtime/linkTypeMap.ts?raw';
import typeSelection from './runtime/typeSelection.ts?raw';
import types from './runtime/types.ts?raw';

export const RUNTIME_TEMPLATE_FILES: { name: string; content: string }[] = [
  { name: 'batcher.ts', content: batcher },
  { name: 'createClient.ts', content: createClient },
  { name: 'error.ts', content: error },
  { name: 'fetcher.ts', content: fetcher },
  { name: 'generateGraphqlOperation.ts', content: generateGraphqlOperation },
  { name: 'index.ts', content: index },
  { name: 'linkTypeMap.ts', content: linkTypeMap },
  { name: 'typeSelection.ts', content: typeSelection },
  { name: 'types.ts', content: types },
];
