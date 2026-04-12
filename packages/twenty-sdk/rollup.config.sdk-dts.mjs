import dts from 'rollup-plugin-dts';

// Generates a self-contained SDK declaration file directly from source,
// inlining types from twenty-shared so npm consumers don't need it.
export default {
  input: 'src/sdk/index.ts',
  output: {
    file: 'dist/sdk/index.d.ts',
    format: 'es',
  },
  external: (id) => {
    if (id === 'twenty-shared' || id.startsWith('twenty-shared/')) {
      return false;
    }
    if (id.startsWith('@/')) {
      return false;
    }
    return !id.startsWith('.') && !id.startsWith('/');
  },
  plugins: [
    dts({
      tsconfig: './tsconfig.lib.json',
      respectExternal: true,
    }),
  ],
};
