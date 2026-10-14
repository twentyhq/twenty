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
    onBuild: () => completedPhases.push('build'),
  }).catch((error: unknown) => {
    throw createInstallFailure({
      error,
      phase: 'build',
      completedPhases,
      signal,
    });
  });

  output.progress(`Installing the registered app on ${target.apiUrl}…`);

  const result = await installRegisteredApp({
    universalIdentifier,
    completedPhases,
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
