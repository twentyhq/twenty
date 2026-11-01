import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { formatToolingDiagnostic } from '@/app/format-tooling-diagnostic';
import { resolveAppProject } from '@/app/project/resolve-app-project';
import { readAppIdentity } from '@/app/read-app-identity';
import { readStringOption } from '@/catalog/read-command-values';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const readApplicationIdentifier = async ({
  context,
  onIdentityRead,
}: {
  context: TargetCommandContext;
  onIdentityRead: () => void;
}) => {
  const universalIdentifier = readStringOption(
    context.options,
    'universalIdentifier',
  );

  if (isDefined(universalIdentifier)) {
    if (!isValidUniversalIdentifier(universalIdentifier)) {
      throw new CliError({
        code: 'INVALID_INPUT',
        exitCode: EXIT_CODE.USAGE,
        message: `--universal-identifier must be a UUID of version 4 or later, not ${universalIdentifier}.`,
      });
    }

    return universalIdentifier.toLowerCase();
  }

  const { options, output, outputMode, signal } = context;
  const project = await resolveAppProject({
    explicitPath: readStringOption(options, 'path'),
    workingDirectory: process.cwd(),
  });
  const identity = await readAppIdentity({
    appPath: project.path,
    signal,
    warn: output.warn,
  });

  if (!isDefined(identity.application)) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: 'This project has no application definition.',
    });
  }

  if (outputMode === 'human') {
    for (const diagnostic of identity.diagnostics) {
      output.progress({ message: formatToolingDiagnostic(diagnostic) });
    }
  }

  onIdentityRead();

  return identity.application.universalIdentifier.toLowerCase();
};
