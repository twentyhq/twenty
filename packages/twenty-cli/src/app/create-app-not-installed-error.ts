import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const createAppNotInstalledError = ({
  universalIdentifier,
  apiUrl,
}: {
  universalIdentifier: string;
  apiUrl: string;
}) =>
  new CliError({
    code: 'APP_NOT_INSTALLED',
    exitCode: EXIT_CODE.NOT_FOUND,
    message: `No app with universal identifier ${universalIdentifier} is installed on ${apiUrl}.`,
    details: { universalIdentifier },
  });
