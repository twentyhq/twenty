import dts from 'rollup-plugin-dts';

const external = (id) => {
  if (id === 'twenty-shared' || id.startsWith('twenty-shared/')) {
    return false;
  }
  if (id.startsWith('@/')) {
    return false;
  }
  return !id.startsWith('.') && !id.startsWith('/');
};

const plugins = [
  dts({
    tsconfig: './tsconfig.lib.json',
    respectExternal: true,
  }),
];

export default [
  {
    input: 'src/sdk/define/index.ts',
    output: { file: 'dist/define/index.d.ts', format: 'es' },
    external,
    plugins,
  },
  {
    input: 'src/sdk/front-component/index.ts',
    output: { file: 'dist/front-component/index.d.ts', format: 'es' },
    external,
    plugins,
  },
];
