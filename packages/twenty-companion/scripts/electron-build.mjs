export const electronBuildOptions = {
  entryPoints: { main: 'src/main/main.ts', preload: 'src/main/preload.ts' },
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outdir: 'dist',
  outExtension: { '.js': '.cjs' },
  external: ['electron', '@recallai/desktop-sdk'],
  sourcemap: true,
};
