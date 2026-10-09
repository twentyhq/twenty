import { basename, isAbsolute, relative, resolve } from 'node:path';

import { isNonEmptyString } from '@sniptt/guards';

import { APP_TEMPLATE_PACKAGE_VERSION } from '@/app/constants/app-template-package-version.constant';
import { APP_TEMPLATE_FIRST_PARTY_PACKAGES } from '@/app/constants/app-template-packages.constant';
import { convertToLabel } from '@/app/convert-to-label';
import { createAppProject } from '@/app/create-app-project';
import { formatAppInitSummary } from '@/app/format-app-init-summary';
import { getAppInitNextSteps } from '@/app/get-app-init-next-steps';
import { isValidPackageName } from '@/app/is-valid-package-name';
import {
  readStringArgument,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { hasConfiguredTarget } from '@/target/has-configured-target';

const toDisplayPath = ({
  workingDirectory,
  appDirectory,
}: {
  workingDirectory: string;
  appDirectory: string;
}) => {
  const relativePath = relative(workingDirectory, appDirectory);

  if (relativePath === '') {
    return '.';
  }

  return relativePath.startsWith('..') || isAbsolute(relativePath)
    ? appDirectory
    : relativePath;
};

export const runAppInitCommand: CommandRun = async ({
  arguments: commandArguments,
  options,
  output,
  signal,
}) => {
  const appName = readStringArgument(commandArguments, 0)?.trim() ?? '';

  if (!isValidPackageName(appName)) {
    throw new CliError({
      code: 'INVALID_APP_NAME',
      exitCode: EXIT_CODE.USAGE,
      message: `"${appName}" is not a valid package name.`,
      hint: 'Use lowercase letters, digits, hyphens, dots or underscores, for example my-app.',
    });
  }

  const workingDirectory = process.cwd();
  const appDirectory = resolve(
    workingDirectory,
    readStringOption(options, 'path') ?? basename(appName),
  );
  const displayName = readStringOption(options, 'displayName')?.trim();
  const appDisplayName = isNonEmptyString(displayName)
    ? displayName
    : convertToLabel(appName);
  const appDescription = readStringOption(options, 'description')?.trim() ?? '';
  const displayPath = toDisplayPath({ workingDirectory, appDirectory });
  const location = displayPath === '.' ? 'the current directory' : displayPath;

  output.progress(`Creating ${appName} in ${location}…`);

  await createAppProject({
    appDirectory,
    appName,
    appDisplayName,
    appDescription,
    signal,
  });

  const remoteName = readStringOption(options, 'remote');
  const nextSteps = getAppInitNextSteps({
    displayPath,
    isTargetConfigured: await hasConfiguredTarget({
      environment: process.env,
      remoteFlag: remoteName,
    }),
    remoteName,
  });
  const packageNames = [...APP_TEMPLATE_FIRST_PARTY_PACKAGES];

  return {
    data: {
      app: {
        name: appName,
        displayName: appDisplayName,
        description: appDescription,
        path: appDirectory,
      },
      packages: packageNames.map((name) => ({
        name,
        version: APP_TEMPLATE_PACKAGE_VERSION,
      })),
      nextSteps,
    },
    human: formatAppInitSummary({
      appName,
      location,
      packageNames,
      packageVersion: APP_TEMPLATE_PACKAGE_VERSION,
      nextSteps,
    }),
  };
};
