import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type Plugin } from 'vite';

const DOMUTILS_STUB_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../src/polyfills/selectors/stubs/domutilsAdapterStub.ts',
);

// css-select imports domutils only as its default adapter; the worker always
// supplies its own, so the dependency would otherwise ship as dead weight.
export const createDomutilsStubPlugin = (): Plugin => ({
  name: 'twenty-domutils-stub',
  enforce: 'pre',
  resolveId: (source) => (source === 'domutils' ? DOMUTILS_STUB_PATH : null),
});
