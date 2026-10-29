import { basename, resolve } from 'node:path';

import { isDefined } from 'twenty-shared/utils';

import { createAppProject } from '@/app/create-app-project';
import { requireApproval } from '@/app/deployment/require-approval';
import { installAppDependencies } from '@/app/install-app-dependencies';
import { isValidPackageName } from '@/app/is-valid-package-name';
import { kebabCase } from '@/app/pull/kebab-case';
import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandContext } from '@/catalog/types/command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { promptInTerminal } from '@/input/prompt-in-terminal';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';

export const createPullProject = async ({
  context,
  displayName,
}: {
  context: CommandContext;
  displayName: string;
}) => {
  const { options, signal, output } = context;
  const canPrompt = isInteractionAllowed(context);
  const defaultDirectory = kebabCase(displayName) || 'workspace-app';
  let path = readStringOption(options, 'path');

  if (!isDefined(path) && canPrompt) {
    path =
      (
        await promptInTerminal({
          question: `No Twenty app found. Directory for the workspace custom app [./${formatDataValue(defaultDirectory)}]: `,
          signal,
        })
      ).trim() || defaultDirectory;
  }

  if (!isDefined(path)) {
    throw new CliError({
      code: 'APP_PATH_REQUIRED',
      exitCode: EXIT_CODE.USAGE,
      message: 'Choose a directory for the workspace custom application.',
      hint: 'Pass --path <new-or-empty-directory> --yes to create the project, install its dependencies and pull.',
    });
  }

  const appDirectory = resolve(process.cwd(), path);
  const appName = kebabCase(basename(appDirectory));

  if (!isValidPackageName(appName)) {
    throw new CliError({
      code: 'INVALID_APP_NAME',
      exitCode: EXIT_CODE.USAGE,
      message: 'The directory name cannot be used as an app package name.',
      hint: 'Choose a directory such as workspace-app.',
    });
  }

  await requireApproval({
    isApproved: readBooleanOption(options, 'yes'),
    canPrompt,
    question: `Create ${formatDataValue(displayName)} in ${formatDataValue(appDirectory)}, install its dependencies and pull?`,
    code: 'CONFIRMATION_REQUIRED',
    message:
      'Pull needs to create a local project and install its dependencies.',
    hint: 'Pass --yes to create the project and install its dependencies.',
    declinedMessage: 'Pull stopped before creating the project.',
    signal,
  });

  output.progress({
    message: `Creating ${appName} in ${formatDataValue(appDirectory)}…`,
  });
  await createAppProject({
    appDirectory,
    appName,
    appDisplayName: displayName,
    appDescription: '',
    shouldIncludeExample: false,
    signal,
  });
  await installAppDependencies({ appPath: appDirectory, signal, output });

  return { path: appDirectory, name: appName };
};
