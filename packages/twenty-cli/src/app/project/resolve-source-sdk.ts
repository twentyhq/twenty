import { createRequire } from 'node:module';
import { join } from 'node:path';

import { isString } from '@sniptt/guards';
import satisfies from 'semver/functions/satisfies';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { checkNodeRequirement } from '@/app/project/check-node-requirement';
import { resolveInstalledSdk } from '@/app/project/resolve-installed-sdk';
import { resolveInsideSdk } from '@/app/project/resolve-inside-sdk';
import { CliError } from '@/output/cli-error';
import { type CliWarning } from '@/output/types/cli-warning.type';

const SOURCE_SDK_RANGE = '>=1.23.0';
const SOURCE_ENTRY_POINTS = ['twenty-sdk/define', 'twenty-sdk/front-component'];

export const resolveSourceSdk = async ({
  appPath,
  warn,
}: {
  appPath: string;
  warn?: (warning: CliWarning) => void;
}) => {
  const sdk = await resolveInstalledSdk(appPath);
  const version = isString(sdk.packageJson.version)
    ? sdk.packageJson.version
    : 'unknown';
  const details = { appPath, sdkPath: sdk.path, sdkVersion: version };
  const resolveFromApp = createRequire(join(appPath, 'package.json')).resolve;
  const missingEntryPoints = SOURCE_ENTRY_POINTS.filter(
    (specifier) =>
      !isDefined(
        resolveInsideSdk({ resolveFromApp, specifier, sdkPath: sdk.path }),
      ),
  );

  if (
    !satisfies(version, SOURCE_SDK_RANGE, { includePrerelease: true }) ||
    missingEntryPoints.length > 0
  ) {
    throw new CliError({
      code: 'SDK_SOURCE_UNSUPPORTED',
      message: `twenty-sdk ${version} cannot load app source with this CLI. Source loading needs twenty-sdk ${SOURCE_SDK_RANGE} with its define and front-component entry points.`,
      hint: 'Install a compatible twenty-sdk version in this app.',
      details: {
        ...details,
        supportedRange: SOURCE_SDK_RANGE,
        missingEntryPoints,
      },
    });
  }

  const requiredNode = isPlainObject(sdk.packageJson.engines)
    ? sdk.packageJson.engines.node
    : undefined;

  if (isDefined(requiredNode)) {
    const requirement = isString(requiredNode)
      ? checkNodeRequirement({
          version: process.versions.node,
          range: requiredNode,
        })
      : 'invalid';

    if (requirement === 'outsideRange') {
      warn?.({
        code: 'NODE_VERSION_UNTESTED',
        message: `twenty-sdk ${version} declares Node ${String(requiredNode)}; continuing on Node ${process.versions.node}, which is outside that range.`,
      });
    } else if (requirement !== 'satisfied') {
      throw new CliError({
        code:
          requirement === 'invalid'
            ? 'SDK_SOURCE_UNSUPPORTED'
            : 'NODE_VERSION_UNSUPPORTED',
        message: `twenty-sdk ${version} declares Node ${String(requiredNode)}; this is Node ${process.versions.node}.`,
        hint:
          requirement === 'invalid'
            ? 'Install a twenty-sdk version with a valid Node requirement.'
            : 'Switch to a supported Node version, then try again.',
        details: { ...details, requiredNode },
      });
    }
  }

  return { version, packagePath: sdk.path };
};
