import { builtinModules } from 'node:module';

import packageJson from './package.json';

const externalDeps = [
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.devDependencies).filter(
    (dep) => dep !== 'twenty-shared',
  ),
];

// The SDK also runs in Node (server app sync, integration tests), but Vite's
// lib build resolves for the browser and stubs any bundled Node builtin, which
// throws when Node touches it. Externalize them all so they stay real imports.
const nodeBuiltins = new Set<string>([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
]);

const isNodeBuiltin = (id: string) =>
  id.startsWith('node:') || nodeBuiltins.has(id);

export const isExternal = (id: string) =>
  isNodeBuiltin(id) ||
  externalDeps.some((dep) => id === dep || id.startsWith(`${dep}/`));

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
