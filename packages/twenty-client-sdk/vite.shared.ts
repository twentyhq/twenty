import packageJson from './package.json';

const externalDeps = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.devDependencies).filter(
    (dep) => dep !== 'twenty-shared',
  ),
  'node:fs/promises',
  'node:fs',
  'node:path',
  'node:os',
  'node:url',
];

export const isExternal = (id: string) =>
  externalDeps.some((dep) => id === dep || id.startsWith(`${dep}/`));

// Per-entry output naming shared by the multi-entry build (vite.config.ts) and
// the single-entry metadata build (vite.metadata.config.ts): core.mjs,
// metadata.cjs, etc.
export const entryFileNames = (chunk: any, extension: 'cjs' | 'mjs') => {
  if (!chunk.isEntry) {
    throw new Error(
      `Should never occur, encountered a non entry chunk ${chunk.facadeModuleId}`,
    );
  }

  const splitFaceModuleId = chunk.facadeModuleId?.split('/');
  if (splitFaceModuleId === undefined) {
    throw new Error(
      `Should never occur, splitFaceModuleId is undefined ${chunk.facadeModuleId}`,
    );
  }

  const moduleDirectory = splitFaceModuleId[splitFaceModuleId?.length - 2];
  if (moduleDirectory === 'src') {
    return `${chunk.name}.${extension}`;
  }
  return `${moduleDirectory}.${extension}`;
};
