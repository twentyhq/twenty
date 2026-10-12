import { executeAppFunction } from '@/app/exec/execute-app-function';
import { formatFunctionExecution } from '@/app/exec/format-function-execution';
import { readExecManifest } from '@/app/exec/read-exec-manifest';
import { readFunctionSelector } from '@/app/exec/read-function-selector';
import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { formatDataValue } from '@/data/format-data-value';
import { parseJsonObjectInput } from '@/input/parse-json-input';
import { readInputValue } from '@/input/read-input-value';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const runAppExecCommand: CommandRun<TargetCommandContext> = async (
  context,
) => {
  const { options, target, signal, output, outputMode } = context;
  const selector = readFunctionSelector(options);

  if (target.credentialKind !== 'oauth') {
    throw new CliError({
      code: 'AUTH_REQUIRED',
      exitCode: EXIT_CODE.AUTHENTICATION,
      message:
        'Running logic functions requires a signed-in user. API keys cannot execute them.',
      hint: `Sign in with twenty auth login --url ${target.apiUrl} --name dev, then use --remote dev.`,
      details: { credentialKind: target.credentialKind },
    });
  }

  const payload = parseJsonObjectInput({
    text: await readInputValue({
      value: readStringOption(options, 'payload') ?? '{}',
      optionName: '--payload',
      signal,
    }),
    optionName: '--payload',
  });
  const manifest = await readExecManifest(context);
  if (selector.kind === 'hook') {
    output.progress(
      'Executing the hook only; this does not install or uninstall the app.',
    );
  }
  const result = await executeAppFunction({
    manifest,
    selector,
    payload,
    target,
    signal,
    onExecuting: (name) =>
      output.progress(
        `Executing ${formatDataValue(name)} on ${target.apiUrl}…`,
      ),
  });
  const human = formatFunctionExecution(
    result,
    result.status === 'SUCCESS' ? process.stdout : process.stderr,
  );

  if (result.status !== 'SUCCESS') {
    if (outputMode === 'human') {
      output.progress(human);
    }
    throw new CliError({
      code: 'EXECUTION_FAILED',
      message: `Function ${formatDataValue(result.functionName)} returned ${formatDataValue(result.status)}.`,
      details: {
        ...result,
        outcome: 'completed',
        diagnostics: manifest.diagnostics,
      },
    });
  }

  return { data: { ...result, diagnostics: manifest.diagnostics }, human };
};
