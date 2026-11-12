import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import ts from 'typescript';
import { APPLICATION_SOURCE_FILE_EXTENSIONS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { isInsideDirectory } from '@/utils/is-inside-directory';
import { recordWatchFile } from '@/app/dev/collect-watch-inputs';

const SCRIPT_EXTENSION = /\.[cm]?[jt]sx?$/;

export const collectApplicationSourceFiles = ({
  appPath,
  entryPaths,
  buildInputs,
}: {
  appPath: string;
  entryPaths: string[];
  buildInputs: string[];
}): string[] => {
  if (entryPaths.length === 0) return [];

  const root = realpathSync(appPath);
  const files = new Set<string>();
  const pending: string[] = [];
  const addFile = (filePath: string) => {
    const requestedPath = resolve(filePath);
    const appRelativePath = relative(resolve(appPath), requestedPath);
    const absolutePath = isInsideDirectory({
      filePath: requestedPath,
      directory: resolve(appPath),
    })
      ? resolve(root, appRelativePath)
      : requestedPath;
    if (absolutePath.split(sep).includes('node_modules')) return;
    const localPath = relative(root, absolutePath);
    const realPath = realpathSync(absolutePath);
    if (
      !isInsideDirectory({ filePath: absolutePath, directory: root }) ||
      !isInsideDirectory({ filePath: realPath, directory: root }) ||
      localPath.split(sep).some((part) => part.startsWith('.')) ||
      localPath === 'manifest.json' ||
      !APPLICATION_SOURCE_FILE_EXTENSIONS.some(
        (extension) => extension === extname(localPath).toLowerCase(),
      ) ||
      !statSync(absolutePath).isFile()
    ) {
      return;
    }
    if (files.has(absolutePath)) return;
    files.add(absolutePath);
    recordWatchFile(absolutePath);
    if (SCRIPT_EXTENSION.test(absolutePath)) pending.push(absolutePath);
  };

  const configuration = ts.getParsedCommandLineOfConfigFile(
    resolve(root, 'tsconfig.json'),
    {},
    {
      ...ts.sys,
      readFile: (path) => {
        if (existsSync(path)) addFile(path);
        return ts.sys.readFile(path);
      },
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        );
      },
    },
  );
  if (!isDefined(configuration))
    throw new Error('Cannot read application tsconfig.json.');

  for (const path of configuration.fileNames.filter(
    (path) =>
      path.endsWith('.d.ts') &&
      !relative(root, path)
        .split(sep)
        .some((part) => part.startsWith('.') || part === 'dist'),
  ))
    addFile(path);
  for (const path of entryPaths) addFile(resolve(root, path));
  const resolutionCache = ts.createModuleResolutionCache(
    root,
    (path) => path,
    configuration.options,
  );
  const remainingBuildInputs = [...buildInputs];
  while (pending.length > 0 || remainingBuildInputs.length > 0) {
    const path = pending.pop();
    if (!isDefined(path)) {
      for (const input of remainingBuildInputs.splice(0)) {
        // Virtual esbuild modules have no source file to restore.
        if (existsSync(input)) addFile(input);
      }
      continue;
    }
    const source = ts.preProcessFile(readFileSync(path, 'utf8'), true, true);
    for (const reference of source.referencedFiles) {
      addFile(resolve(dirname(path), reference.fileName));
    }
    for (const imported of source.importedFiles) {
      const resolved = ts.resolveModuleName(
        imported.fileName,
        path,
        configuration.options,
        ts.sys,
        resolutionCache,
      ).resolvedModule;
      if (isDefined(resolved)) {
        if (!resolved.isExternalLibraryImport)
          addFile(resolved.resolvedFileName);
      } else if (imported.fileName.startsWith('.')) {
        const assetPath = resolve(dirname(path), imported.fileName);
        if (existsSync(assetPath)) addFile(assetPath);
        else
          throw new Error(
            `Cannot preserve missing application source ${imported.fileName} imported by ${path}`,
          );
      }
    }
  }

  return [...files]
    .map((path) => relative(root, path).split(sep).join('/'))
    .sort();
};
