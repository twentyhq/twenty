import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: './tsup.index.tsx' },
    format: ['cjs', 'esm'],
    dts: true,
    outDir: '../twenty-server/src/emails/generated',
  },
]);
