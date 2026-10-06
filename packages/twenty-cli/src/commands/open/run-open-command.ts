import {
  readBooleanOption,
  readStringArgument,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { resolveWorkspacePageUrl } from '@/commands/open/resolve-workspace-page-url';
import { openBrowser } from '@/oauth/open-browser';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';
import { fetchWorkspaceUrl } from '@/transport/metadata/fetch-workspace-url';

export const runOpenCommand: CommandRun<TargetCommandContext> = async ({
  arguments: commandArguments,
  options,
  outputMode,
  target,
  signal,
}) => {
  const isUrlOnly = readBooleanOption(options, 'urlOnly');

  if (!isUrlOnly && !isInteractionAllowed({ options, outputMode })) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message:
        'twenty open only opens a browser in an interactive terminal, not with --no-input, JSON output, redirected stdin or in CI.',
      hint: 'Add --url-only to print the address instead.',
    });
  }

  const url = resolveWorkspacePageUrl({
    workspaceUrl: await fetchWorkspaceUrl({ target, signal }),
    page: readStringArgument(commandArguments, 0),
  });

  if (isUrlOnly) {
    return { data: { url }, human: url };
  }

  openBrowser(url);

  return { data: { url }, human: `Opening ${url} in your browser.` };
};
