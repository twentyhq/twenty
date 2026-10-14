import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { runAppBuild } from '@/app/run-app-operation';
import { readStringOption } from '@/catalog/read-command-values';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const readApplicationIdentifier = async ({
  context,
  onBuild,
}: {
  context: TargetCommandContext;
  onBuild: () => void;
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

  const { data: build } = await runAppBuild({ context });

  onBuild();

  return build.application.universalIdentifier.toLowerCase();
};
