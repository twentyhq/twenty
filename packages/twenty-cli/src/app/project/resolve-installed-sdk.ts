import { realpath } from 'node:fs/promises';
import { join } from 'node:path';

import { isDefined } from 'twenty-shared/utils';

import { hasYarnPlugAndPlay } from '@/app/project/has-yarn-plug-and-play';
import { listAncestorDirectories } from '@/app/project/list-ancestor-directories';
import { readJsonObject } from '@/app/read-json-object';
import { pathExists } from '@/app/fs-utils';
import { CliError } from '@/output/cli-error';

const findInstalledSdk = async (appPath: string) => {
  for (const directory of listAncestorDirectories(appPath)) {
    const packagePath = join(directory, 'node_modules', 'twenty-sdk');
    const isInstalled = await pathExists(packagePath);

    if (!isInstalled) {
      continue;
    }

    const packageJson = await readJsonObject(join(packagePath, 'package.json'));

    if (!isDefined(packageJson) || packageJson.name !== 'twenty-sdk') {
      throw new CliError({
        code: 'TOOLING_UNSUPPORTED',
        message: `The twenty-sdk installation at ${packagePath} is incomplete: it has no readable twenty-sdk package.json.`,
        hint: "Reinstall the app's dependencies (for example with yarn install), then try again.",
        details: { appPath, sdkPath: packagePath },
      });
    }

    return { path: await realpath(packagePath), packageJson };
  }

  return undefined;
};

const throwMissingSdk = async (appPath: string): Promise<never> => {
  if (await hasYarnPlugAndPlay(appPath)) {
    throw new CliError({
      code: 'TOOLING_UNSUPPORTED',
      message:
        "This app uses Yarn Plug'n'Play, which the twenty CLI cannot load the SDK from.",
      hint: 'Set nodeLinker: node-modules in .yarnrc.yml, then run yarn install.',
      details: { appPath },
    });
  }

  throw new CliError({
    code: 'SDK_NOT_INSTALLED',
    message: 'twenty-sdk is not installed for this app.',
    hint: "Install the app's dependencies (for example with yarn install), then try again.",
    details: { appPath },
  });
};

export const resolveInstalledSdk = async (appPath: string) => {
  const sdk = await findInstalledSdk(appPath);

  return isDefined(sdk) ? sdk : throwMissingSdk(appPath);
};
