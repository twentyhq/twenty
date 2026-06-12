import path from 'node:path';

import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const TWENTY_SDK_SRC = path.resolve(
  __dirname,
  '../../../twenty-sdk/src/sdk',
);

// twenty-sdk's `exports` map points at compiled `./dist/*`. Aliasing the
// subpaths to source keeps unit tests self-contained — no `yarn build` in
// twenty-sdk required before running them.
export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['tsconfig.spec.json'],
      ignoreConfigErrors: true,
    }),
  ],
  resolve: {
    alias: [
      {
        find: 'twenty-sdk/logic-function',
        replacement: path.join(TWENTY_SDK_SRC, 'logic-function/index.ts'),
      },
      {
        find: 'twenty-sdk/define',
        replacement: path.join(TWENTY_SDK_SRC, 'define/index.ts'),
      },
      // The SDK source uses `@/*` to refer to its own `src/`. Vitest
      // doesn't pick up the SDK's tsconfig path mapping when resolving
      // a different package, so map the alias here.
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, '../../../twenty-sdk/src/$1'),
      },
    ],
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
