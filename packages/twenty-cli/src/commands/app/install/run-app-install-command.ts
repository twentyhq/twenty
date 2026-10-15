import { createInstallFailure } from '@/app/deployment/create-install-failure';
import { installRegisteredApp } from '@/app/deployment/install-registered-app';
import { type AppInstallPhase } from '@/app/deployment/types/app-install-phase.type';
import { readApplicationIdentifier } from '@/app/read-application-identifier';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { formatSuccessLine } from '@/output/style';

export const runAppInstallCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const { target, signal, output } = context;
  const completedPhases: AppInstallPhase[] = [];
  const universalIdentifier = await readApplicationIdentifier({
    context,
    onIdentityRead: () => completedPhases.push('identity'),
  }).catch((error: unknown) => {
    throw createInstallFailure({
      error,
      phase: 'identity',
      completedPhases,
      signal,
    });
  });

  const progressMessage = `Installing the registered app on ${target.apiUrl}…`;

  output.progress({ message: progressMessage, percentage: 0 });

  const result = await installRegisteredApp({
    universalIdentifier,
    completedPhases,
    target,
    signal,
    onProgress: (percentage) =>
      output.progress({ message: progressMessage, percentage }),
  });

  return {
    data: result,
    human: formatSuccessLine(
      `Installed ${formatDataValue(result.application.name)} on ${target.apiUrl}`,
    ),
  };
};
