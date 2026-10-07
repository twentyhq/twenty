import { realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

import type ts from 'typescript';

import { hasYarnPlugAndPlay } from '@/app/project/has-yarn-plug-and-play';
import { isTypeScriptCompilerApi } from '@/app/typecheck/is-typescript-compiler-api';
import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';
import { pathExists } from '@/app/fs-utils';
import { readJsonObject } from '@/app/read-json-object';
import { CliError } from '@/output/cli-error';
import { isInsideDirectory } from '@/utils/is-inside-directory';

export const resolveProjectTypeScript = async (
  appPath: string,
): Promise<typeof ts> => {
  const requireFromApp = createRequire(join(appPath, 'package.json'));
  const ancestors = listAncestorDirectories(appPath);

  for (const directory of ancestors) {
    const installedPath = join(directory, 'node_modules/typescript');

    if (!(await pathExists(installedPath))) {
      continue;
    }

    const compilerPath = await realpath(installedPath);
    const packageJson = await readJsonObject(
      join(compilerPath, 'package.json'),
    );
    const unsupported = () =>
      new CliError({
        code: 'TOOLING_UNSUPPORTED',
        message: `The TypeScript installation at ${compilerPath} does not provide the compiler API this CLI needs. Reinstall a compatible typescript version in this app.`,
        details: {
          appPath,
          compilerPath,
          compilerVersion: packageJson?.version,
        },
      });

    if (packageJson?.name !== 'typescript') {
      throw unsupported();
    }

    let entryPath: string;

    try {
      entryPath = requireFromApp.resolve(compilerPath);
    } catch {
      throw unsupported();
    }

    if (!isInsideDirectory({ filePath: entryPath, directory: compilerPath })) {
      throw unsupported();
    }

    const compiler: unknown = requireFromApp(entryPath);

    if (!isTypeScriptCompilerApi(compiler)) {
      throw unsupported();
    }

    return compiler;
  }

  const hasPlugAndPlay = await hasYarnPlugAndPlay(appPath);

  throw new CliError({
    code: hasPlugAndPlay ? 'TOOLING_UNSUPPORTED' : 'TYPESCRIPT_NOT_INSTALLED',
    message: hasPlugAndPlay
      ? "This app uses Yarn Plug'n'Play, which the twenty CLI cannot load TypeScript from. Set nodeLinker: node-modules in .yarnrc.yml and reinstall the app's dependencies."
      : "TypeScript is not installed for this app. Install typescript in the app's devDependencies, then try again.",
    details: { appPath },
  });
};
