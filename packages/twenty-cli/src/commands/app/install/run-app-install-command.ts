import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { installRegisteredApp } from '@/app/deployment/install-registered-app';
import { runAppBuild } from '@/app/run-app-operation';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatSuccessLine } from '@/output/style';

export const runAppInstallCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const { options, target, signal, output } = context;
  let universalIdentifier = readStringOption(options, 'universalIdentifier');

  if (
    isDefined(universalIdentifier) &&
    !isValidUniversalIdentifier(universalIdentifier)
  ) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: `--universal-identifier must be a UUID of version 4 or later, not ${universalIdentifier}.`,
    });
  }

  if (!isDefined(universalIdentifier)) {
    const { data: build } = await runAppBuild({ context });
    universalIdentifier = build.application.universalIdentifier;
  }

  output.progress(`Installing the registered app on ${target.apiUrl}…`);

  const result = await installRegisteredApp({
    universalIdentifier: universalIdentifier.toLowerCase(),
    target,
    signal,
    onQueued: (jobId) =>
      output.progress(`Waiting for installation ${formatDataValue(jobId)}…`),
  });

  return {
    data: result,
    human: formatSuccessLine(
      `Installed ${formatDataValue(result.application.name)} on ${target.apiUrl}`,
    ),
  };
};
