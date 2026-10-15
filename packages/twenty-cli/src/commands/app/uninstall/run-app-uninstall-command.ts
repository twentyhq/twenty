import { createUninstallFailure } from '@/app/deployment/create-uninstall-failure';
import { fetchInstalledApp } from '@/app/fetch-installed-app';
import { requireApproval } from '@/app/deployment/require-approval';
import { readApplicationIdentifier } from '@/app/read-application-identifier';
import { type AppUninstallPhase } from '@/app/deployment/types/app-uninstall-phase.type';
import { uninstallApp } from '@/app/deployment/uninstall-app';
import { readBooleanOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { dimText, formatSuccessLine } from '@/output/style';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';

export const runAppUninstallCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const { options, target, signal, output, outputMode } = context;
  const completedPhases: AppUninstallPhase[] = [];
  const fail = (error: unknown, phase: AppUninstallPhase) =>
    createUninstallFailure({ error, phase, completedPhases, signal });

  const universalIdentifier = await readApplicationIdentifier({
    context,
    onIdentityRead: () => completedPhases.push('identity'),
  }).catch((error: unknown) => {
    throw fail(error, 'identity');
  });

  output.progress({ message: `Checking the app on ${target.apiUrl}…` });

  const installedApp = await fetchInstalledApp({
    universalIdentifier,
    target,
    signal,
  }).catch((error: unknown) => {
    throw fail(error, 'check');
  });
  const appName = formatDataValue(installedApp.name);

  if (!installedApp.canBeUninstalled) {
    throw fail(
      new CliError({
        code: 'APP_NOT_UNINSTALLABLE',
        exitCode: EXIT_CODE.CONFLICT,
        message: `${appName} cannot be uninstalled from ${target.apiUrl}.`,
      }),
      'check',
    );
  }

  completedPhases.push('check');

  await requireApproval({
    isApproved: readBooleanOption(options, 'yes'),
    canPrompt: isInteractionAllowed({ options, outputMode }),
    question: `Uninstall ${appName} from ${target.apiUrl}? Its objects, fields and their data are permanently deleted.`,
    code: 'CONFIRMATION_REQUIRED',
    message: `Uninstalling ${appName} permanently deletes its objects, fields and their data.`,
    hint: 'Pass --yes to uninstall it.',
    declinedMessage: 'Uninstall stopped at the confirmation prompt.',
    signal,
  }).catch((error: unknown) => {
    throw fail(error, 'confirmation');
  });

  output.progress({ message: `Uninstalling ${appName}…` });

  await uninstallApp({ universalIdentifier, target, signal }).catch(
    (error: unknown) => {
      throw fail(error, 'uninstall');
    },
  );

  completedPhases.push('uninstall');

  return {
    data: {
      application: { universalIdentifier, name: installedApp.name },
      uninstalled: true,
      completedPhases,
    },
    human: [
      formatSuccessLine(`Uninstalled ${appName} from ${target.apiUrl}`),
      dimText(
        '  Its registration is kept, so twenty app apply can install it again.',
      ),
    ].join('\n'),
  };
};
